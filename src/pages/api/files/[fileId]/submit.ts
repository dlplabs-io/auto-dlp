import { NextApiRequest, NextApiResponse } from 'next';
import { encodeFunctionData } from 'viem';
import { GelatoRelay, RelayRequestOptions, SponsoredCallRequest} from '@gelatonetwork/relay-sdk-viem';
import { DATA_REGISTRY_ABI } from '@/contracts/DataRegistryABI';
import { FormattedProof } from '@/types';
import { Database } from "@/types/supabase";
import { vanaChain } from '@/lib/chains';
import { ENV } from '@/config/env';
import { FILES_TABLE, GetSupabaseClient } from '@/lib/supabase';

// RelayParams for Vana
const gelatoRelayParams = {
  contract: {
    relay1BalanceERC2771: "0x61F2976610970AFeDc1d83229e1E21bdc3D5cbE4",
    relayERC2771: "0x8aCE64CEA52b409F930f60B516F65197faD4B056",
    relayConcurrentERC2771: "0xc7739c195618D314C08E8626C98f8573E4E43634",
    relay1BalanceConcurrentERC2771:
      "0x2e8235caa6a16E64D7F73b8DBC257369FBF2972D",
    relayERC2771zkSync: "",
    relay1BalanceERC2771zkSync: "",
    relayConcurrentERC2771zkSync: "",
    relay1BalanceConcurrentERC2771zkSync: "",
  },
};

/**
 * Converts a formatted proof to the argument format required by the smart contract
 */
function proofToArgs(proof: FormattedProof) {
  const args = [
    proof.fileId,
    [
      proof.signature,
      [
        BigInt(Math.floor(proof.data.score * 1e18)), // Shouldn't be any data loss with math.floor
        proof.data.dlpId,
        proof.data.metadata,
        proof.data.proofUrl,
        proof.data.instruction,
      ]
    ]
  ];
  return args;
}

/**
 * Parses a raw proof object from the database into a properly typed FormattedProof
 */
function parseProof(rawProof: Record<string, any>): FormattedProof | null {
  try {
    // Extract the proof object if it's nested (common in our DB structure)
    const proofData = rawProof.proof || rawProof;
    
    // Validate the proof structure matches our expected format
    if (!proofData.fileId || !proofData.signature || !proofData.data ||
        typeof proofData.data.score !== 'number' ||
        typeof proofData.data.dlpId !== 'number' ||
        typeof proofData.data.metadata !== 'string' ||
        typeof proofData.data.proofUrl !== 'string' ||
        typeof proofData.data.instruction !== 'string') {
      return null;
    }

    return {
      fileId: proofData.fileId,
      signature: proofData.signature,
      data: {
        score: proofData.data.score,
        dlpId: proofData.data.dlpId,
        metadata: proofData.data.metadata,
        proofUrl: proofData.data.proofUrl,
        instruction: proofData.data.instruction
      }
    };
  } catch (error) {
    console.error('Error parsing proof:', error);
    return null;
  }
}

/**
 * Submits a proof to the blockchain via the Gelato relay service
 * 
 * This endpoint:
 * 1. Takes a fileId as a path parameter
 * 2. Checks if the file already has a proof transaction on chain
 * 3. If not, submits the proof to the blockchain using the prover wallet
 * 4. Updates the file record with the transaction details
 * 
 * Path Parameters:
 * - fileId: Blockchain file ID (required)
 * 
 * @param req - NextJS API request with fileId as path parameter
 * @param res - NextJS API response
 * @returns JSON response with submission status or appropriate error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract fileId from the path parameter
  const { fileId } = req.query;

  // Validate the fileId parameter
  if (!fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'fileId is required in the path' });
  }

  const supabase = GetSupabaseClient();

  try {
    // Get file with proof information
    const { data: file, error: fileError } = await supabase
      .from(FILES_TABLE)
      .select('*')
      .eq('blockchainFileId', fileId)
      .single();

    if (fileError) {
      throw new Error(`Error fetching file: ${fileError.message}`);
    }

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if proof already exists
    if (!file.proof) {
      return res.status(400).json({ 
        error: 'No proof exists for this file. Generate a proof first.' 
      });
    }

    // Check if proof is already on chain
    if (file.is_onchain && file.proof_txn) {
      return res.status(200).json({ 
        message: 'Proof already submitted to blockchain',
        fileId: file.blockchainFileId,
        transactionHash: file.proof_txn
      });
    }

    // Parse the proof from the database
    const parsedProof = parseProof(file.proof as Record<string, any>);
    if (!parsedProof) {
      return res.status(400).json({ error: 'Invalid proof structure' });
    }

    // Initialize Gelato relay
    const relay = new GelatoRelay(gelatoRelayParams);

    // Encode the function call data
    const data = encodeFunctionData({
      abi: DATA_REGISTRY_ABI,
      functionName: "addProof",
      args: proofToArgs(parsedProof),
    });

    const relayOptions: RelayRequestOptions = {
      retries: 2,
    };

    // Prepare the relay request
    const relayRequest = {
      chainId: BigInt(vanaChain.id),
      target: ENV.DATAREGISTRY_CONTRACT_ADDRESS,
      data: data,
    } as SponsoredCallRequest;

    // Submit the transaction via Gelato relay
    const response = await relay.sponsoredCall(
      relayRequest,
      ENV.GELATO_RELAY_API_KEY,
      relayOptions,
    );
    
    // Update relay_url in the database
    const taskStatusUrl = `https://relay.gelato.digital/tasks/status/${response.taskId}`;
    const { error: updateError } = await supabase
      .from(FILES_TABLE)
      .update({
        relay_url: taskStatusUrl,
        updated_at: new Date().toISOString(),
        status: 'pending' as Database['public']['Enums']['file_status']
      })
      .eq('blockchainFileId', fileId);

    if (updateError) {
      console.error(`Error updating relay_url for file ${fileId}:`, updateError);
    }

    // Return the task ID to the client
    return res.status(202).json({
      message: 'Proof submission initiated',
      fileId: fileId,
      taskId: response.taskId,
      relayUrl: taskStatusUrl
    });

  } catch (error) {
    console.error('Error submitting proof:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Error submitting proof',
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Unknown error occurred while submitting proof' 
    });
  }
}
