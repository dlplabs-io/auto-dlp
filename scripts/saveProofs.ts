import { GetSupabaseClient } from '@/lib/supabase';
import { FormattedProof } from '@/types';
import fs from 'fs';
import { ENV } from '@/config/env';

async function main() {
  try {
    const supabase = GetSupabaseClient();

    // Read the formatted proofs
    const proofs: FormattedProof[] = JSON.parse(fs.readFileSync('./out/formattedProofs.json', 'utf-8'));
    console.log(`Found ${proofs.length} proofs to save to database`);

    // Process proofs in batches to avoid overwhelming the database
    const BATCH_SIZE = 20;
    let successCount = 0;
    let failureCount = 0;

    // TODO: revert iterator to i < proofs.length
    for (let i = 0; i < proofs.length; i += BATCH_SIZE) {
      const batch = proofs.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(proofs.length / BATCH_SIZE)}`);

      // Process each proof in the batch
      const batchPromises = batch.map(async (proof) => {
        try {
          // Update the files table with the proof
          const { error } = await supabase
            .from('files')
            .update({ 
              proof: JSON.stringify(proof)
            })
            .eq('blockchainFileId', proof.fileId);

          if (error) {
            console.error(`Error saving proof for file ${proof.fileId}:`, error);
            failureCount++;
            return false;
          }

          successCount++;
          return true;
        } catch (error) {
          console.error(`Error processing proof for file ${proof.fileId}:`, error);
          failureCount++;
          return false;
        }
      });

      // Wait for all proofs in the batch to be processed
      await Promise.all(batchPromises);

      // Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < proofs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\nFinished processing all proofs:`);
    console.log(`Successfully saved: ${successCount}`);
    console.log(`Failed to save: ${failureCount}`);

  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main();
