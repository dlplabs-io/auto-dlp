import { NextApiRequest, NextApiResponse } from "next";
import {
  createPublicClient,
  http,
  parseAbiItem,
  decodeEventLog,
  toEventHash,
} from "viem";
import { vanaChain } from "@/lib/chains";
import { DATA_REGISTRY_ABI } from "@/contracts/DataRegistryABI";
import { ENV } from "@/config/env";
import axios from "axios";
import { GetSupabaseClient } from "@/lib/supabase";

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
  task: TransactionStatusResponse;
};

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: vanaChain,
  transport: http(ENV.RPC_ENDPOINT),
});

// Maximum number of polling attempts
const MAX_POLLING_ATTEMPTS = 30;
// Time to wait between polling attempts (in milliseconds)
const POLLING_INTERVAL = 2000;

async function processProfile(profileId: string) {
  const supabase = GetSupabaseClient();

  try {
    // Get profile with relay URL
    const { data: profile, error: profileError } = await supabase
      .from("accounts") // (!!! profiles_wallet > accounts)
      .select("*")
      .eq("public_id", profileId)
      .single();

    if (profileError || !profile?.dataregistry_url) {
      // (!!!) profile.dimo_dataregistry_relay_url > profile.dataregistry_url
      throw new Error(
        `Profile not found or missing relay URL: ${profileError?.message}`
      );
    }

    // Function to check if task state requires polling
    const requiresPolling = (state: GelatoTaskState) => {
      return (
        state === GelatoTaskState.CheckPending ||
        state === GelatoTaskState.ExecPending ||
        state === GelatoTaskState.WaitingForConfirmation
      );
    };

    // Poll until we get a final state
    let attempts = 0;
    let task: TransactionStatusResponse | null = null;

    while (attempts < MAX_POLLING_ATTEMPTS) {
      const response = await axios.get<GelatoRelayResponse>(
        profile.dataregistry_url // (!!!) profile.dimo_dataregistry_relay_url > profile.dataregistry_url
      );
      task = response.data.task;

      if (!requiresPolling(task.taskState)) {
        break;
      }

      console.log(
        `Profile ${profile.id} task state is ${task.taskState}, polling... (attempt ${attempts + 1}/${MAX_POLLING_ATTEMPTS})`
      );
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
      attempts++;
    }

    if (attempts >= MAX_POLLING_ATTEMPTS) {
      throw new Error(`Polling timeout reached for profile ${profile.id}`);
    }

    if (task == null) {
      throw new Error(`No task found for profile ${profile.id}`);
    }

    if (task.taskState !== GelatoTaskState.ExecSuccess) {
      console.log(
        `Profile ${profile.id} task state is ${task.taskState}, skipping`
      );
      return 0;
    }

    // Get transaction receipt
    const receipt = await publicClient.getTransactionReceipt({
      hash: task.transactionHash as `0x${string}`,
    });

    // Parse logs for FileAdded events
    const fileAddedEvent = parseAbiItem(
      "event FileAdded(uint256 indexed fileId, address indexed ownerAddress, string url)"
    );
    const eventSelector = toEventHash(fileAddedEvent);

    const logs = receipt.logs
      .filter((log) => log.topics[0] === eventSelector)
      .map((log) => {
        const decoded = decodeEventLog({
          abi: [fileAddedEvent],
          data: log.data,
          topics: log.topics,
        });
        return decoded.args;
      });

    if (logs.length === 0) {
      console.log(`No FileAdded events found for profile ${profile.id}`);
      return 0;
    }

    // Process each file event
    for (const args of logs) {
      const fileData = {
        blockchainFileId: Number(args.fileId),
        ownerIdFkey: profile.public_id,
        url: args.url,
        txnHash: task.transactionHash as string,
        is_onchain: false,
        createdAt: task.executionDate,
        relay_url: profile.dataregistry_url, // (!!!) profile.dimo_dataregistry_relay_url > profile.dataregistry_url
        proofTxn: null,
        proof: null,
      };

      // First try to get existing file
      const { data: existingFile } = await supabase
        .from("files_accounts") // (!!!) files > files_accounts
        .select("*")
        .eq("blockchainFileId", fileData.blockchainFileId)
        .single();

      if (!existingFile) {
        // Create new file entry if it doesn't exist
        const { error: insertError } = await supabase
          .from("files_accounts") // (!!!) files > files_accounts
          .insert([fileData]);

        if (insertError) {
          console.error(
            `Error inserting file ${fileData.blockchainFileId}:`,
            insertError
          );
          continue;
        }
      } else {
        // Update existing file if needed
        if (fileData.createdAt == existingFile.createdAt) {
          // skip the same file
          continue;
        }

        const { error: updateError } = await supabase
          .from("files")
          .update(fileData)
          .eq("blockchainFileId", fileData.blockchainFileId);

        if (updateError) {
          console.error(
            `Error updating file ${fileData.blockchainFileId}:`,
            updateError
          );
          continue;
        }
      }
    }

    return logs.length;
  } catch (error) {
    console.error(`Error processing profile ${profileId}:`, error);
    throw error;
  }
}

type ProcessProfileResult = {
  profileId: string;
  filesProcessed: number;
  error?: string;
};

type SyncResponse = {
  success: boolean;
  results: ProcessProfileResult[];
  totalFilesProcessed: number;
  failedProfiles: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { profileIds } = req.body;

    if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Array of profile IDs is required" });
    }

    // Process all profiles concurrently
    const results = await Promise.all(
      profileIds.map(async (profileId): Promise<ProcessProfileResult> => {
        try {
          const filesProcessed = await processProfile(profileId);
          return {
            profileId,
            filesProcessed: filesProcessed ?? 0,
          };
        } catch (error: any) {
          return {
            profileId,
            filesProcessed: 0,
            error: error.message,
          };
        }
      })
    );

    // Calculate summary statistics
    const totalFilesProcessed = results.reduce(
      (sum, result) => sum + result.filesProcessed,
      0
    );
    const failedProfiles = results
      .filter((result) => result.error || result.filesProcessed === 0)
      .map((result) => result.profileId);

    const response: SyncResponse = {
      success: true,
      results,
      totalFilesProcessed,
      failedProfiles,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error in sync endpoint:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
