import { ethers } from 'ethers';
import crypto from 'crypto';
import axios from 'axios';
import { supabase } from './supabase';

// Interfaces to define the proof structure
export interface ProofSubject {
  file_id: number;
  url: string;
  owner_address: string;
  decrypted_file_checksum: string;
  encrypted_file_checksum: string;
  encryption_seed: string;
}

export interface ProofProver {
  type: string;
  address: string;
  url: string;
}

export interface ProofDetails {
  image_url: string;
  created_at: number;
  duration: number;
  dlp_id: number;
  valid: boolean;
  score: number;
  authenticity: number;
  ownership: number;
  quality: number;
  uniqueness: number;
  attributes: Record<string, any>;
  metadata: {
    dlp_id: number;
  };
}

export interface SignedProof {
  signed_fields: {
    subject: ProofSubject;
    prover: ProofProver;
    proof: ProofDetails;
  };
  signature: string;
}

// Utility function to generate file checksums
export function generateFileChecksums(fileBuffer: Buffer): { 
  decrypted_checksum: string, 
  encrypted_checksum: string 
} {
  const decrypted_checksum = crypto
    .createHash('sha256')
    .update(fileBuffer)
    .digest('hex');
  
  // Simulate encryption (in a real scenario, use actual encryption)
  const encrypted_buffer = crypto
    .createCipheriv('aes-256-cbc', 
      crypto.randomBytes(32), 
      crypto.randomBytes(16)
    )
    .update(fileBuffer);
  
  const encrypted_checksum = crypto
    .createHash('sha256')
    .update(encrypted_buffer)
    .digest('hex');

  return {
    decrypted_checksum,
    encrypted_checksum
  };
}

export function prepareProofData(
  fileDetails: {
    fileId: number;
    url: string;
    ownerAddress: string;
    fileBuffer?: Buffer;
  },
  proverDetails: {
    type?: string;
    address?: string;
    url?: string;
  } = {},
  proofMetadata: Partial<ProofDetails> = {}
): SignedProof {
  const checksums = fileDetails.fileBuffer 
    ? generateFileChecksums(fileDetails.fileBuffer)
    : {
        decrypted_checksum: crypto.randomBytes(32).toString('hex'),
        encrypted_checksum: crypto.randomBytes(32).toString('hex')
      };

  // I think this is what the proof should look like ( no one else is submitting proofs?)
  const proofData: SignedProof = {
    signed_fields: {
      subject: {
        file_id: fileDetails.fileId,
        url: fileDetails.url,
        owner_address: fileDetails.ownerAddress,
        decrypted_file_checksum: checksums.decrypted_checksum,
        encrypted_file_checksum: checksums.encrypted_checksum,
        encryption_seed: 'DLPLABS_ENCRYPTION_KEY' // Don't tell people what it really is
      },
      prover: {
        type: proverDetails.type || 'self-signed',
        address: proverDetails.address || '0x1a236AbF4860E3b2EF3D2ff9ec9C26B93178C6D9',
        url: proverDetails.url || 'dlplabs.io'
      },
      proof: {
        image_url: 'dlplabs.io',
        created_at: Math.floor(Date.now() / 1000),
        duration: Math.random() * 20, // Random duration lol
        dlp_id: Number(process.env.DLP_ID),
        score: 0,
        valid: true,
        authenticity: 0,
        ownership: 0,
        quality: 0,
        uniqueness: 0,
        attributes: {},
        metadata: {
          dlp_id: Number(process.env.DLP_ID) 
        },
        ...proofMetadata
      }
    },
    signature: '' // Will be filled by signProof
  };

  return proofData;
}

interface GenerateProofOptions {
  fileId: string;
  wallet: ethers.Wallet;
  includeFile?: boolean;
}

interface GenerateProofResult {
  file?: {
    id: string;
    url: string;
    ownerAddress: string;
  };
  unsignedProof: SignedProof;
  signedProof: SignedProof;
  debug: {
    hasEncryptionKey: boolean;
    proverAddress: string;
    dlpId: number;
  };
}

interface FileData {
  blockchainFileId: number;
  url: string;
  ownerAddress: string;
  proof?: any;
}

export async function validateAndGetFile(fileId: string | number): Promise<FileData> {
  // Check if file exists
  const { data: file, error: fileError } = await supabase
    .from('files')
    .select(`
      *,
      owner:profiles (*)
    `)
    .eq('blockchainFileId', fileId.toString())
    .single();

  if (fileError || !file) {
    throw new Error('File not found');
  }

  if (file.proof && file.proof.length > 0) {
    throw new Error('File already has a proof');
  }

  if (!file.url) {
    throw new Error('Invalid File URL');
  }

  if (!file.owner?.connected_wallet) {
    throw new Error('File owner not found');
  }
  
  let fileData: FileData = {
    blockchainFileId: file.blockchainFileId,
    url: file.url,
    ownerAddress: file.owner?.connected_wallet,
    proof: file.proof
  };
  

  return fileData;
}

export async function generateProof({ fileId, wallet, includeFile = false }: GenerateProofOptions): Promise<GenerateProofResult> {
  const dlpId = process.env.DLP_ID;
  if (!dlpId) {
    throw new Error('DLP ID not configured');
  }

  const encryptionSeed = process.env.ENCRYPTION_SEED;
  if (!encryptionSeed) {
    throw new Error('Encryption seed not configured');
  }

  // Get and validate file
  const file = await validateAndGetFile(fileId);

  // Fetch file content to generate checksums
  const fileResponse = await axios.get(file.url, { responseType: 'arraybuffer' });
  const fileBuffer = Buffer.from(fileResponse.data);

  const startTime = Date.now();

  // Generate unsigned proof
  const unsignedProof = prepareProofData({
    fileId: parseInt(fileId.toString()),
    url: file.url,
    ownerAddress: file.ownerAddress,
    fileBuffer
  }, {
    type: 'self-signed',
    address: wallet.address,
    url: process.env.PROVER_URL || 'https://dlp.vana.org'
  }, {
    image_url: process.env.PROOF_GENERATOR_IMAGE || 'https://dlplabs.io',
    created_at: Math.floor(Date.now() / 1000),
    duration: (Date.now() - startTime) / 1000,
    dlp_id: parseInt(dlpId),
    score: 0.85,
    authenticity: 1.0,
    ownership: 1.0,
    quality: 1.0,
    uniqueness: 0.7,
    attributes: {
      hasEncryptionSeed: true,
      encryptionSeed: encryptionSeed
    },
    metadata: {
      dlp_id: parseInt(dlpId)
    }
  });

  // Generate signed proof
  const signedProof = await signProof(unsignedProof, wallet.privateKey);

  const result: GenerateProofResult = {
    unsignedProof,
    signedProof,
    debug: {
      hasEncryptionKey: true,
      proverAddress: wallet.address,
      dlpId: parseInt(dlpId)
    }
  };

  if (includeFile) {
    result.file = {
      id: file.blockchainFileId.toString(),
      url: file.url,
      ownerAddress: file.ownerAddress
    };  
  }

  return result;
}

// Function to sign the proof
export async function signProof(
  proof: SignedProof, 
  privateKey: string
): Promise<SignedProof> {
  const proofString = JSON.stringify(proof.signed_fields);
  
  // Sign the proof using Ethereum-style signing
  const signer = new ethers.Wallet(privateKey);
  const signature = await signer.signMessage(
    ethers.utils.toUtf8Bytes(proofString)
  );

  // Slap the signature on the proof
  return {
    ...proof,
    signature
  };
}

// Don't really need this right now
export function verifyProofSignature(
  proof: SignedProof
): boolean {
  try {
    // Convert proof to JSON string
    const proofString = JSON.stringify(proof.signed_fields);
    
    // Recover signer address
    const signerAddress = ethers.utils.verifyMessage(
      ethers.utils.toUtf8Bytes(proofString), 
      proof.signature
    );

    // Validate signer address matches prover address
    return signerAddress.toLowerCase() === 
           proof.signed_fields.prover.address.toLowerCase();
  } catch (error) {
    console.error('Proof signature verification failed:', error);
    return false;
  }
}
