import { NextApiRequest, NextApiResponse } from 'next';
import { createPublicClient, http, parseAbiItem, decodeEventLog, toEventHash } from 'viem';
import { vanaChain } from '@/lib/chains';
import { DATA_REGISTRY_ABI } from '@/contracts/DataRegistryABI';
import { ENV } from '@/config/env';
import axios from 'axios';
import { FILES_TABLE, ACCOUNTS_TABLE, GetSupabaseClient } from '@/lib/supabase';

enum GelatoTaskState {
  CheckPending = "CheckPending",
  ExecPending = "ExecPending",
  WaitingForConfirmation = "WaitingForConfirmation",
  ExecSuccess = "ExecSuccess",
  ExecReverted = "ExecReverted",
  Cancelled = "Cancelled",
}

type TransactionStatusResponse = {
  chainId: number;
  taskId: string;
  taskState: GelatoTaskState;
  creationDate: string;
  lastCheckDate?: string;
  lastCheckMessage?: string;
  transactionHash?: string;
  blockNumber?: number;
  executionDate?: string;
  gasUsed?: string;
  effectiveGasPrice?: string;
};

type GelatoRelayResponse = {
  task: TransactionStatusResponse
}

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: vanaChain,
  transport: http(ENV.RPC_ENDPOINT)
});

// Maximum number of polling attempts
const MAX_POLLING_ATTEMPTS = 30;
// Time to wait between polling attempts (in milliseconds)
const POLLING_INTERVAL = 2000;

// TODO: move into a shared location
async function processAccount(accountId: string) {
  const supabase = GetSupabaseClient();

  try {
    // Get account with relay URL
    const { data: account, error: accountError } = await supabase
      .from(ACCOUNTS_TABLE)
      .select('*')
      .eq('public_id', accountId)
      .single();

    if (accountError || !account?.dataregistry_url) {
      throw new Error(`Profile not found or missing relay URL: ${accountError?.message}`);
    }

    // Function to check if task state requires polling
    const requiresPolling = (state: GelatoTaskState) => {
      return state === GelatoTaskState.CheckPending ||
             state === GelatoTaskState.ExecPending ||
             state === GelatoTaskState.WaitingForConfirmation;
    };

    // Poll until we get a final state
    let attempts = 0;
    let task: TransactionStatusResponse | null = null;
    
    while (attempts < MAX_POLLING_ATTEMPTS) {
      const response = await axios.get<GelatoRelayResponse>(account.dataregistry_url);
      task = response.data.task;
      
      if (!requiresPolling(task.taskState)) {
        break;
      }
      
      console.log(`Account ${accountId} task state is ${task.taskState}, polling... (attempt ${attempts + 1}/${MAX_POLLING_ATTEMPTS})`);
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
      attempts++;
    }

    if (attempts >= MAX_POLLING_ATTEMPTS) {
      throw new Error(`Polling timeout reached for account ${accountId}`);
    }

    if (task == null) {
      throw new Error(`No task found for account ${accountId}`);
    }

    if (task.taskState !== GelatoTaskState.ExecSuccess) {
      console.log(`Account ${accountId} task state is ${task.taskState}, skipping`);
      return 0;
    }

    // Get transaction receipt
    const receipt = await publicClient.getTransactionReceipt({
      hash: task.transactionHash as `0x${string}`,
    });

    // Parse logs for FileAdded events
    const fileAddedEvent = parseAbiItem('event FileAdded(uint256 indexed fileId, address indexed ownerAddress, string url)');
    const eventSelector = toEventHash(fileAddedEvent);

    const logs = receipt.logs
      .filter(log => log.topics[0] === eventSelector)
      .map(log => {
        const decoded = decodeEventLog({
          abi: [fileAddedEvent],
          data: log.data,
          topics: log.topics,
        });
        return decoded.args;
      });

    if (logs.length === 0) {
      console.log(`No FileAdded events found for account ${accountId}`);
      return 0;
    }

    // Process each file event
    for (const args of logs) {
      const fileData = {
        blockchainFileId: Number(args.fileId),
        ownerIdFkey: account.public_id,
        url: args.url,
        txnHash: task.transactionHash as string,
        is_onchain: false,
        createdAt: task.executionDate,
        relay_url: account.dataregistry_url,
        proofTxn: null,
        proof: null
      };

      // First try to get existing file
      const { data: existingFile } = await supabase
        .from(FILES_TABLE)
        .select('*')
        .eq('blockchainFileId', fileData.blockchainFileId)
        .single();

      if (!existingFile) {
        // Create new file entry if it doesn't exist
        const { error: insertError } = await supabase
          .from(FILES_TABLE)
          .insert([fileData]);

        if (insertError) {
          console.error(`Error inserting file ${fileData.blockchainFileId}:`, insertError);
          continue;
        }
      } else {
        // Update existing file if needed
        if (fileData.createdAt == existingFile.createdAt) {
          // skip the same file
          continue;
        }
        
        const { error: updateError } = await supabase
          .from(FILES_TABLE)
          .update(fileData)
          .eq('blockchainFileId', fileData.blockchainFileId);

        if (updateError) {
          console.error(`Error updating file ${fileData.blockchainFileId}:`, updateError);
          continue;
        }
      }
    }

    return logs.length;
  } catch (error) {
    console.error(`Error processing account ${accountId}:`, error);
    throw error;
  }
}
type ProcessAccountResult = {
  accountId: string;
  filesProcessed: number;
  error?: string;
};

type SyncResponse = {
  success: boolean;
  results: ProcessAccountResult[];
  totalFilesProcessed: number;
  failedAccounts: string[];
};

/**
 * Fetches the files from the dataregistry URL in the accounts table and stores them in the files table
 * Note: This endpoint doesn't generate the proofs for the files
 * 
 * This endpoint processes a list of account IDs by:
 * 1. Fetching transaction data from each account's dataregistry URL
 * 2. Polling the Gelato relay service to check transaction status
 * 3. Extracting FileAdded events from successful transactions
 * 4. Creating or updating file records in the database
 * 
 * @param req - NextJS API request containing accountIds array in the body
 * @param res - NextJS API response
 * @returns JSON response with sync results
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract account IDs from request body
    const { accountIds } = req.body;

    // Validate input
    if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
      return res.status(400).json({ error: 'Array of account IDs is required' });
    }

    // Process all accounts concurrently
    const results = await Promise.all(
      accountIds.map(async (accountId): Promise<ProcessAccountResult> => {
        try {
          // Process each account and count the number of files synced
          const filesProcessed = await processAccount(accountId);
          return {
            accountId,
            filesProcessed: filesProcessed ?? 0
          };
        } catch (error: any) {
          // Handle errors for individual accounts without failing the entire batch
          return {
            accountId,
            filesProcessed: 0,
            error: error.message
          };
        }
      })
    );

    // Calculate summary statistics
    const totalFilesProcessed = results.reduce((sum, result) => sum + result.filesProcessed, 0);
    const failedAccounts = results
      .filter(result => result.error || result.filesProcessed === 0)
      .map(result => result.accountId);

    // Prepare response with summary data
    const response: SyncResponse = {
      success: true,
      results,
      totalFilesProcessed,
      failedAccounts
    };

    return res.status(200).json(response);

  } catch (error: any) {
    // Handle unexpected errors
    console.error('Error in sync endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
