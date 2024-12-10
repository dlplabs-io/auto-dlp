import { ethers } from 'ethers';
import crypto from 'crypto';

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
        type: proverDetails.type || 'satya',
        address: proverDetails.address || '0x1a236AbF4860E3b2EF3D2ff9ec9C26B93178C6D9',
        url: proverDetails.url || 'dlplabs.io'
      },
      proof: {
        image_url: 'dlplabs.io',
        created_at: Math.floor(Date.now() / 1000),
        duration: Math.random() * 20, // Random duration lol
        dlp_id: 523, //TODO: this needs to be replaced with the actual DLP ID. 
        valid: true,
        score: 0,
        authenticity: 0,
        ownership: 0,
        quality: 0,
        uniqueness: 0,
        attributes: {},
        metadata: {
          dlp_id: 523 //TODO: this needs to be replaced with the actual DLP ID. 
        },
        ...proofMetadata
      }
    },
    signature: '' // Will be filled by signProof
  };

  return proofData;
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
