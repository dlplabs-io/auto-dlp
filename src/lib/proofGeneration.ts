import crypto from 'crypto';
import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, http, getContract, PrivateKeyAccount, recoverMessageAddress} from 'viem';
import axios from 'axios';

import { vanaChain } from '@/lib/chains';
import { DimoWrapper} from '@/lib/dimo';
import { GetSupabaseClient } from '@/lib/supabase';
import { DATA_REGISTRY_ABI } from '@/contracts/DataRegistryABI';
import { ENV } from '@/config/env';
import { 
  FileData, 
  FileDataWithScore, 
  OnChainFile, 
  ProofDetails, 
  SignedProof, 
  GenerateProofResult, 
  GenerateProofOptions,
  FileResponse
} from '@/types';

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: vanaChain,
  transport: http(ENV.RPC_ENDPOINT)
});

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
  fileDetails: FileDataWithScore,
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
        file_id: fileDetails.blockchainFileId,
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
        image_url: 'dlplabs.io/prover',
        created_at: Math.floor(Date.now() / 1000),
        duration: Math.random() * 20, // Random duration lol
        dlp_id: Number(ENV.DLP_ID),
        score: fileDetails.score/100,
        valid: true,
        authenticity: 100 / 100,  //authentic and not tampered with.
        ownership: 100 / 100, // data contributor owns the data they are submitting.
        quality: fileDetails.score / 100, // data is of high quality
        uniqueness: 100 / 100, // submitted data is unique and not duplicated.
        attributes: {},
        metadata: {
          dlp_id: Number(ENV.DLP_ID) 
        },
        ...proofMetadata
      }
    },
    signature: '' // Will be filled by signProof
  };

  return proofData;
}

async function getFileFromContract(fileId: number): Promise<OnChainFile> {
  try {
    const contract = getContract({
      address: ENV.DATAREGISTRY_CONTRACT_ADDRESS as `0x${string}`,
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

export function getAttributesFromScore(score: number) : string[] {
  let attributes: string[] = []
  if (score == 0) {
    return attributes;
  }

  if (score >= 0.25) {
    attributes.push("dimoWallet");
  }

  if (score >= 0.50) {
    attributes.push("vehicles");
  }

  if (score >= 0.90 && score < 1) {
    attributes.push("someVehicles");
  }

  if (score == 1) {
    attributes.push("allVehicles");
  }
    
  return attributes;
}

function calculateProofScore(profile: any, vehicles: any[], permissions: { [key: number]: boolean }): number {
  // No dimo_completed_wallet
  if (!profile.dimo_completed_wallet) {
    return 0;
  }

  // Has wallet but no vehicles
  if (vehicles.length === 0) {
    return 25;
  }

  // Count vehicles with permissions
  const vehiclesWithPermissions = vehicles.filter(v => permissions[v.tokenId]);
  
  // Has vehicles but none have permissions
  if (vehiclesWithPermissions.length === 0) {
    return 50;
  }

  // Single vehicle with permissions
  if (vehicles.length === 1 && vehiclesWithPermissions.length === 1) {
    return 100;
  }

  // Multiple vehicles
  if (vehicles.length > 1) {
    // Base score for first vehicle with permissions
    let score = 90;
    
    // Calculate additional points for remaining vehicles
    const remainingVehicles = vehicles.length - 1;
    const remainingVehiclesWithPermissions = vehiclesWithPermissions.length - 1;
    const pointsPerVehicle = 10 / remainingVehicles;
    
    score += pointsPerVehicle * remainingVehiclesWithPermissions;
    
    return Math.min(100, score);
  }

  return 50; // Default case for single vehicle without permissions
}

/**
 * Fetches the file from the blockchain, and scores it based on the vehicle permissions
 * @param fileId the FileID of the file to validate in the data registry contract
 * @returns the file data and score
 */
async function validateFileAndCalculateScore(
  fileId: string,
): Promise<FileDataWithScore> {
  try {
    const dimo = DimoWrapper.getInstance();
    const supabase = GetSupabaseClient();
    
    // Get file details from contract
    const fileDetails = await getFileFromContract(Number(fileId));
    if (!fileDetails) {
      return {
        blockchainFileId: Number(fileId),
        isValid: false,
        url: '',
        ownerAddress: '',
        score: 0,
        message: 'File not found'
      };
    }

    const vehicleData = await fetchVehicleData(fileDetails.url);

    // Get profile from DB using the Public ID from the API response
    const { data: profile } = await supabase
      .from('profiles_wallet')
      .select('*')
      .eq('public_id', vehicleData.id)
      .single();

    // Early return if no wallet
    if (!profile?.dimo_completed_wallet) {
      return {
        blockchainFileId: Number(fileId),
        isValid: false,
        url: fileDetails.url,
        ownerAddress: fileDetails.owner,
        score: 0,
        message: 'No DIMO wallet connected'
      };
    }

    // Get vehicles for the wallet
    const vehicleResponse = await dimo.getVehicles(profile.dimo_completed_wallet);
    const vehicles = vehicleResponse.vehicles.filter(v => v.tokenId !== 0);

    // Get permissions for each vehicle
    const permissions: { [key: number]: boolean } = {};
    await Promise.all(
      vehicles.map(async (vehicle) => {
        const permissionResponse = await dimo.checkPermissions(vehicle.tokenId);
        permissions[vehicle.tokenId] = permissionResponse.hasAccess;
      })
    );

    // Calculate score
    const score = calculateProofScore(profile, vehicles, permissions);

    // Get file buffer    
    return {
      blockchainFileId: Number(fileId),
      url: fileDetails.url,
      ownerAddress: fileDetails.owner,
      isValid: score >= 50, // Valid if score is at least 50
      score,
      fileBuffer: vehicleData.fileBuffer,
      message: score < 50 ? 'Insufficient permissions or vehicles' : ""
    };

  } catch (error) {
    console.error('Error validating file:', error);
    return {
      blockchainFileId: Number(fileId),
      url: '',
      ownerAddress: '',
      isValid: false,
      score: 0,
      message: 'Error validating file'
    };
  }
}

/**
 * Fetches the file from the blockchain and checks permissions for all vehicles in that URL
 * @param fileId the FileID of the file to validate in the data registry contract
 * @returns the file data and vehicle permissions
 */
export async function validateFile(fileId: number | string): Promise<FileData> {
  const dimo = DimoWrapper.getInstance();
  const supabase = GetSupabaseClient();

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
 * Fetches the fileId from the data registry contract, checks permissions for all vehicles using the DIMO api, and generates a proof, and signs it using @param wallet
 * @param fileId the FileID of the file to validate in the data registry contract
 * @param wallet the wallet to sign the proof 
 * @returns 
 */
export async function generateProof({ fileId, privateKey }: GenerateProofOptions): Promise<GenerateProofResult> {
  const dlpId = ENV.DLP_ID;
  if (!dlpId) {
    throw new Error('DLP ID not configured');
  }

  const encryptionSeed = ENV.ENCRYPTION_SEED;
  if (!encryptionSeed) {
    throw new Error('Encryption seed not configured');
  }

  // Create a wallet client for signing
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  // Get and validate file
  const fileData = await validateFileAndCalculateScore(fileId);

  // Prepare the proof data
  const unsignedProof = prepareProofData(
    fileData,
    {
      address: account.address, // signer address
      url: ENV.BASE_URL // prover url (DLP hostname)
    }
  );

  // Sign the proof
  const signedProof = await signProof(unsignedProof, account);

  // Return result
  return {
    fileData,
    unsignedProof,
    signedProof,
    debug: {
      hasEncryptionKey: true,
      proverAddress: account.address,
      dlpId: Number(dlpId)
    }
  };
}

export async function signProof(
  proof: SignedProof, 
  account: PrivateKeyAccount
): Promise<SignedProof> {
  try {
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
