import { createPublicClient, http, parseAbiItem, PublicClient, decodeEventLog, toEventHash } from 'viem';
import { vanaChain } from '@/lib/chains';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { config } from 'dotenv';
import { DATA_REGISTRY_ABI } from '@/contracts/DataRegistryABI';
import { ENV } from '@/config/env';
import dotenv from "dotenv";
dotenv.config();


import axios from 'axios';
import * as fs from 'fs/promises';

interface GelatoRelayResponse {
  task: {
    chainId: number;
    taskId: string;
    taskState: string;
    creationDate: string;
    transactionHash: string;
    executionDate: string;
    blockNumber: number;
    gasUsed: string;
    effectiveGasPrice: string;
  }
}

async function processProfile(profile: any, client: PublicClient) {
  try {
    // Fetch relay data
    const response = await axios.get<GelatoRelayResponse>(profile.dimo_dataregistry_relay_url);
    const { task } = response.data;
    
    if (task.taskState !== 'ExecSuccess') {
      console.log(`Profile ${profile.id} task state is ${task.taskState}, skipping`);
      return null;
    }

    // Get transaction receipt
    const receipt = await client.getTransactionReceipt({
      hash: task.transactionHash as `0x${string}`,
    });

    // Parse logs for FileAdded events
    const fileAddedEvent = parseAbiItem('event FileAdded(uint256 indexed fileId, address indexed ownerAddress, string url)');
    const eventSelector = toEventHash(fileAddedEvent);

    const logs = receipt.logs
      .filter(log => 
        log.topics[0] === eventSelector
      )
      .map(log => {
        const decoded = decodeEventLog({
          abi: [fileAddedEvent],
          data: log.data,
          topics: log.topics,
        });
        return decoded.args;
      });

    if (logs.length === 0) {
      console.log(`No FileAdded events found for profile ${profile.id}`);
      return null;
    }

    // Process the logs
    const fileEvents = logs.map(args => ({
      fileId: args.fileId,
      ownerAddress: args.ownerAddress,
      url: args.url,
      transactionHash: task.transactionHash,
      blockNumber: task.blockNumber,
      profileId: profile.id, // this needs to be the PUBLIC_ID
      createdAt: task.executionDate
    }));

    return fileEvents;

  } catch (error) {
    console.error(`Error processing profile ${profile.id}:`, error);
    return null;
  }
}

async function main() {
  try {

    const supabase = createClient<Database>(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_ACCESS_TOKEN
    );
  
    // Get all profiles with relay URLs
    const { data: profiles, error } = await supabase
      .from('profiles_wallet')
      .select('*')
      .not('dimo_dataregistry_relay_url', 'is', null);

    if (error) {
      throw error;
    }

    console.log(`Found ${profiles.length} profiles with relay URLs`);

    // Initialize viem client
    const client = createPublicClient({
      chain: vanaChain,
      transport: http(ENV.RPC_ENDPOINT)
    });

    // Process all profiles in parallel with a concurrency limit
    const BATCH_SIZE = 10;
    const results = [];

    // TODO: revert iterator to i < profiles.length
    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      const batch = profiles.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(profile => processProfile(profile, client));
      
      console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(profiles.length / BATCH_SIZE)}`);
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(r => r !== null).flat());
      
      // Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < profiles.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\nTotal files found:', results.length);
    
    // Write results to json file
    const json = JSON.stringify(results, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2);
    await fs.writeFile('out/allFiles.json', json);

    // Log summary
    const uniqueProfiles = new Set(results.map(r => r.profileId)).size;
    console.log(`Files found across ${uniqueProfiles} profiles`);

  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main();
