import { createWalletClient, http, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { vanaChain } from '@/lib/chains';
import { GelatoRelay, RelayRequestOptions, SponsoredCallRequest} from '@gelatonetwork/relay-sdk-viem';
import { DATA_REGISTRY_ABI } from '@/contracts/DataRegistryABI';
import { FormattedProof } from '@/types';
import { ENV } from '@/config/env';
import { GetSupabaseClient } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

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

//     function addProof(uint256 fileId, Proof memory proof) external;
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

function parseProof(rawProof: Record<string, any>): FormattedProof | null {
  try {
    // Validate the proof structure matches our expected format
    if (!rawProof.fileId || !rawProof.signature || !rawProof.data ||
        typeof rawProof.data.score !== 'number' ||
        typeof rawProof.data.dlpId !== 'number' ||
        typeof rawProof.data.metadata !== 'string' ||
        typeof rawProof.data.proofUrl !== 'string' ||
        typeof rawProof.data.instruction !== 'string') {
      return null;
    }

    return {
      fileId: rawProof.fileId,
      signature: rawProof.signature,
      data: {
        score: rawProof.data.score,
        dlpId: rawProof.data.dlpId,
        metadata: rawProof.data.metadata,
        proofUrl: rawProof.data.proofUrl,
        instruction: rawProof.data.instruction
      }
    };
  } catch (error) {
    console.error('Error parsing proof:', error);
    return null;
  }
}

async function submitProof(
  proof: FormattedProof,
  supabase: SupabaseClient<Database>,
) {
  try {
    const account = privateKeyToAccount(ENV.PROVER_PRIVATE_KEY);

    const relay = new GelatoRelay(gelatoRelayParams);

    const data = encodeFunctionData({
      abi: DATA_REGISTRY_ABI,
      functionName: "addProof",
      args: proofToArgs(proof),
    });

    const relayOptions: RelayRequestOptions = {
      retries: 2,
    };

    const relayRequest = {
      chainId: BigInt(vanaChain.id),
      target: ENV.DATAREGISTRY_CONTRACT_ADDRESS,
      data: data,
    } as SponsoredCallRequest;

    const response = await relay.sponsoredCall(
      relayRequest,
      ENV.GELATO_RELAY_API_KEY,
      relayOptions,
    );
    
    // Update relay_url in Supabase
    const { error: updateError } = await supabase
      .from('files')
      .update({ 
        relay_url: `https://relay.gelato.digital/tasks/status/${response.taskId}`
      })
      .eq('blockchainFileId', proof.fileId);

    if (updateError) {
      console.error(`Error updating relay_url for file ${proof.fileId}:`, updateError);
    }

    // wait for status to be complete, polling every 10 seconds
    let status = await relay.getTaskStatus(response.taskId);
    console.log(`Proof submission for fileId ${proof.fileId} status: ${status?.taskState}`);
    
    while (status?.taskState !== 'ExecSuccess') {
      console.log("waiting...")
      await new Promise(resolve => setTimeout(resolve, 10000));
      status = await relay.getTaskStatus(response.taskId);
    }

    // Update proof_txn and isOnchain in Supabase
    const { error: txnError } = await supabase
      .from('files')
      .update({ 
        proof_txn: status.transactionHash!,
        is_onchain: true
      })
      .eq('blockchainFileId', proof.fileId);

    if (txnError) {
      console.error(`Error updating transaction hash for file ${proof.fileId}:`, txnError);
    }

    console.log(`Submitted proof for fileId ${proof.fileId}. Relay TaskId: ${response?.taskId}, transactionHash: ${status?.transactionHash}`);
    return status?.transactionHash;
  } catch (error) {
    console.error(`Error submitting proof for fileId ${proof.fileId}:`, error);
    return null;
  }
}

async function main() {
  try {
    const supabase = GetSupabaseClient();

    // Get all files that aren't on chain yet and have a proof
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('is_onchain', false)
      .not('proof', 'is', null);

    if (error) {
      throw error;
    }

    console.log(`Found ${files.length} files to submit proofs for`);

    // Process files sequentially to avoid rate limiting
    for (const file of files) {
      try {
        const parsedProof = parseProof(file.proof as Record<string, any>);
        if (!parsedProof) {
          console.error(`Invalid proof structure for file ${file.blockchainFileId}`);
          continue;
        }

        await submitProof(parsedProof, supabase);
        // Add a small delay between submissions
        
        console.log("Waiting 5 seconds before submitting next");
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Error processing proof for file ${file.blockchainFileId}:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main().catch(console.error);
