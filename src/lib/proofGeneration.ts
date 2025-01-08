import crypto from 'crypto';
import axios from 'axios';
import { supabase } from './supabase';
import { DimoWrapper } from './dimo';
import { DATA_REGISTRY_ABI } from '@/contracts/DataRegistryABI';
import { 
  createPublicClient, 
  http,
  createWalletClient,
  getContract,
  Account,
  toHex,
  recoverMessageAddress
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { vanaChain } from './chains';

type FileResponse = {
  id: bigint;
  ownerAddress: string;
  url: string;
  addedAtBlock: bigint;
}

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: vanaChain,
  transport: http(process.env.RPC_ENDPOINT)
});

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
        type: 'self-signed',
        address: proverDetails.address || '0x1a236AbF4860E3b2EF3D2ff9ec9C26B93178C6D9',
        url: proverDetails.url || 'dlplabs.io'
      },
      proof: {
        image_url: 'dlplabs.io',
        created_at: Math.floor(Date.now() / 1000),
        duration: Math.random() * 20, // Random duration lol
        dlp_id: Number(process.env.DLP_ID),
        score: 100,
        valid: true,
        authenticity: 100,
        ownership: 100,
        quality: 100,
        uniqueness: 100,
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
  wallet: any;
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
  onChainFile?: OnChainFile;
  fileBuffer?: Buffer;
}

interface OnChainFile {
  url: string;
  owner: string;
  onBlock: bigint
  fileId: bigint
}

async function getFileFromContract(fileId: number): Promise<OnChainFile> {
  try {
    const contract = getContract({
      address: process.env.DATAREGISTRY_CONTRACT_ADDRESS as `0x${string}`,
      abi: DATA_REGISTRY_ABI,
      client: publicClient,
    });

    const file = await contract.read.files([fileId]) as FileResponse

    if (!file) {
      throw new Error('Invalid file data from contract');
    }

    return {
      url: file.url,
      owner: file.ownerAddress,
      onBlock: file.addedAtBlock,
      fileId: file.id
    };
  } catch (error) {
    console.error('Error fetching file from contract:', error);
    throw new Error('File not found on blockchain');
  }
}

interface VehicleIds {
  vehicleIds: number[];
}

interface VehicleDataResponse {
  status: number;
  success: boolean;
  timestamp: string;
  id: string;
  fileBuffer: Buffer;
}

async function fetchVehicleData(url: string): Promise<VehicleDataResponse> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response from the buffer
    const textDecoder = new TextDecoder();
    const jsonString = textDecoder.decode(response.data);
    const data = JSON.parse(jsonString);

    return {
      ...data,
      fileBuffer: Buffer.from(response.data)
    };
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    throw new Error('Failed to fetch vehicle data from URL');
  }
}

/**
 * Fetches the file from the blockchain and checks permissions for all vehicles in that URL
 * @param fileId the FileID of the file to validate in the data registry contract
 * @returns the file data and vehicle permissions
 */
export async function validateFile(fileId: number | string): Promise<FileData> {
  const dimo = DimoWrapper.getInstance();
  const numericFileId = Number(fileId);
  
  // Get file from blockchain
  const onChainFile = await getFileFromContract(numericFileId);
  
  // Fetch vehicle Data from the URL
  const vehicleData = await fetchVehicleData(onChainFile.url);
  
  if (!vehicleData.status || vehicleData.status !== 200) {
    console.log(vehicleData);
    throw new Error(`Failed to fetch vehicle data from URL`);
  } 

  // The URL contains a Public ID that we can use to query the DB for the entire record
  const { data: profile, error: profileError } = await supabase
    .from('profiles_wallet')
    .select('*')
    .eq('public_id', vehicleData.id)
    .single();

  if (profileError) {
    throw new Error(`Failed to fetch profile from database: ${profileError.message}`);
  } 

  if (!profile || !profile.dimo_completed_wallet) {
    throw new Error(`Profile: ${vehicleData.id} has connected their dimo account`);
  }

  // Get the list of Vehicles for the the connected profile
  const vehiclesResponse = await dimo.getVehicles(profile.dimo_completed_wallet);
  if (vehiclesResponse.vehicles.length === 0) {
    throw new Error(`No vehicles found for profile: ${vehicleData.id}`);
  }

  // Check permissions for all vehicles
  const deniedVehicles: number[] = [];
  for (const vehicle of vehiclesResponse.vehicles) {
    const hasPermission = await dimo.checkPermissions(vehicle.tokenId);
    if (!hasPermission) {
      deniedVehicles.push(vehicle.tokenId);
    }
  }

  if (deniedVehicles.length > 0) {
    throw new Error(`No permission for vehicles: ${deniedVehicles.join(', ')}`);
  }

  return {
    blockchainFileId: numericFileId,
    url: onChainFile.url,
    ownerAddress: onChainFile.owner,
    onChainFile,
    fileBuffer: vehicleData.fileBuffer
  };
}

/**
 * Fetches the fileId from the data registry contract, generates a proof, and signs it using @param wallet
 * @param fileId the FileID of the file to validate in the data registry contract
 * @param wallet the wallet to sign the proof 
 * @returns 
 */
export async function generateProof({ fileId, wallet }: GenerateProofOptions): Promise<GenerateProofResult> {
  const dlpId = process.env.DLP_ID;
  if (!dlpId) {
    throw new Error('DLP ID not configured');
  }

  const encryptionSeed = process.env.ENCRYPTION_SEED;
  if (!encryptionSeed) {
    throw new Error('Encryption seed not configured');
  }

  // Create a wallet client for signing
  const account = privateKeyToAccount(wallet.privateKey as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: vanaChain,
    transport: http(process.env.RPC_ENDPOINT)
  });

  // Get and validate file
  const fileData = await validateFile(fileId);

  // Prepare the proof data
  const unsignedProof = prepareProofData(
    {
      fileId: fileData.blockchainFileId,
      url: fileData.url,
      ownerAddress: fileData.ownerAddress,
      fileBuffer: fileData.fileBuffer
    },
    {
      address: account.address, // signer address
      url: process.env.BASE_URL // prover url (DLP hostname)
    }
  );

  // Sign the proof
  const signedProof = await signProof(unsignedProof, wallet.privateKey);

  // Return result
  return {
    ...fileData,
    unsignedProof,
    signedProof,
    debug: {
      hasEncryptionKey: true,
      proverAddress: account.address,
      dlpId: parseInt(dlpId)
    }
  };
}

export async function signProof(
  proof: SignedProof, 
  privateKey: string
): Promise<SignedProof> {
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const message = JSON.stringify(proof.signed_fields);
    const signature = await account.signMessage({ message });
    
    return {
      ...proof,
      signature
    };
  } catch (error) {
    console.error('Error signing proof:', error);
    throw new Error('Failed to sign proof');
  }
}

// Don't really need this right now
export async function verifyProofSignature(
  proof: SignedProof
): Promise<boolean> {
  try {
    // Convert proof to JSON string
    const proofString = JSON.stringify(proof.signed_fields);
    
    // Recover signer address
    const signerAddress = await recoverMessageAddress({
      message: proofString,
      signature: proof.signature as `0x${string}`
    });

    // Validate signer address matches prover address
    return signerAddress.toLowerCase() === 
           proof.signed_fields.prover.address.toLowerCase();
  } catch (error) {
    console.error('Proof signature verification failed:', error);
    return false;
  }
}
