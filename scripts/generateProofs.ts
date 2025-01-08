import dotenv from 'dotenv';
dotenv.config();

import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import * as fs from 'fs/promises';
import { createWalletClient, http, WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { vanaChain } from '@/lib/chains';
import { generateProof } from '@/lib/proofGeneration';
import { GetSupabaseClient } from '@/lib/supabase';


interface FileEvent {
  fileId: string;
  ownerAddress: string;
  url: string;
  transactionHash: string;
  blockNumber: number;
  profileId: string;
  createdAt: string;
}

async function generateAndSaveProof(
  fileId: string, 
  supabase: SupabaseClient<Database>,
  walletClient: WalletClient
) {
  try {
    
    const proof = await generateProof(
      { fileId: fileId, privateKey: process.env.DATA_REGISTRY_WALLET_PRIVATE_KEY! },
    );

    if (!proof) {
      console.warn(`No proof generated for file ${fileId}`);
      return null;
    }

    // Update Supabase
    // const { error } = await supabase
    //   .from('files')
    //   .update({ proof: JSON.stringify(proof) })
    //   .eq('blockchainFileId', Number(fileId));

    // if (error) {
    //   console.error(`Error updating proof for file ${fileId}:`, error);
    //   return null;
    // }

    return proof;

  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error);
    return null;
  }
}

async function main() {
  try {

    // Initialize Supabase client
    const supabase = GetSupabaseClient();

    // Read the JSON file
    const fileContent = await fs.readFile('out/allFiles.json', 'utf-8');
    const files: FileEvent[] = JSON.parse(fileContent);

    console.log(`Found ${files.length} files to process`);

    // Initialize wallet client
    const account = privateKeyToAccount(process.env.DATA_REGISTRY_WALLET_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: vanaChain,
      transport: http(process.env.RPC_ENDPOINT)
    });

    // Process files in batches
    const BATCH_SIZE = 20;
    const results = [];

    // TODO: revert iterator to i < files.length
    for (let i = 0; i <files.length ; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(files.length / BATCH_SIZE)}`);
      
      const batchPromises = batch.map(file => 
        generateAndSaveProof(file.fileId, supabase, walletClient)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(r => r !== null));
      
      // Add a small delay between batches
      if (i + BATCH_SIZE < files.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Save results to JSON
    const formattedResults = results.map(result => {
      return {
        fileId: result.fileData.blockchainFileId,
        proof: result.signedProof
      }
    });

    const json = JSON.stringify(formattedResults, null, 2);
    await fs.writeFile('out/proofs.json', json);

    console.log(`\nProcessed ${files.length} files`);
    console.log(`Successfully generated ${results.length} proofs`);

  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main();
