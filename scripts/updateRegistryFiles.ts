import dotenv from 'dotenv';
dotenv.config();

import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { randomUUID } from "crypto";
import * as fs from 'fs/promises';

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

async function updateSupabaseFiles(supabase: SupabaseClient<Database>, files: FileEvent[]) {
  console.log('\nUpdating Supabase files table...');
  
  const updates = files.map((file): Database['public']['Tables']['files']['Row'] =>  ({
    id: randomUUID(), 
    ownerIdFkey: file.profileId,
    blockchainFileId: Number(file.fileId),
    url: file.url,
    txnHash: file.transactionHash,
    createdAt: file.createdAt,
    proof : null,
    is_onchain: false,
    proof_txn: null,
    relay_url: null
  }));

  // Maybe this should be insert?
  const { data, error } = await supabase
    .from('files')
    .upsert(updates, {
      onConflict: 'blockchainFileId',
      ignoreDuplicates: true
    });

  if (error) {
    console.error('Error updating files table:', error);
    return;
  }

  console.log(`Updated ${updates.length} files in Supabase`);
}

async function main() {
  try {
    
    const supabase = GetSupabaseClient();
    // Read the JSON file
    const fileContent = await fs.readFile('out/allFiles.json', 'utf-8');
    const files: FileEvent[] = JSON.parse(fileContent);

    console.log(`Found ${files.length} files in JSON`);

    // Update Supabase
    await updateSupabaseFiles(supabase, files);

    // Log summary
    const uniqueProfiles = new Set(files.map(f => f.profileId)).size;
    console.log(`Files from ${uniqueProfiles} unique profiles`);

  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main();
