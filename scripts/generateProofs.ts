import fs from 'fs/promises';
import { GetSupabaseClient } from '@/lib/supabase';
import { generateProof } from '@/lib/proofGeneration';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { FileEvent } from '@/types';

import dotenv from 'dotenv';
dotenv.config();

import { createWalletClient, http, WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { vanaChain } from '@/lib/chains';

async function generateAndSaveProof(
  fileId: string, 
  supabase: SupabaseClient<Database>,
) {
  try {
    
    const proof = await generateProof(
      { fileId: fileId, privateKey: process.env.PROVER_PRIVATE_KEY! },
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

    // Process files in batches
    const BATCH_SIZE = 20;
    const results = [];

    // TODO: revert iterator to i < files.length
    for (let i = 0; i <files.length ; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(files.length / BATCH_SIZE)}`);
      
      const batchPromises = batch.map(file => 
        generateAndSaveProof(file.fileId, supabase)
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
