import dotenv from 'dotenv';
dotenv.config();

import { GetSupabaseClient } from '@/lib/supabase';
import { DimoWrapper } from '../src/lib/dimo';
import fs from 'fs/promises';

type UserAddressAndTokenId = {
  address: string;
  tokenId: number;
};

async function processProfile(profile: any, dimoClient: DimoWrapper) {
  try {
    const response = await dimoClient.getVehicles(profile.dimo_completed_wallet);
    const vehicles = response.vehicles
      .filter(vehicle => vehicle.tokenId !== 0)
      .map(vehicle => ({
        address: profile.dimo_completed_wallet,
        tokenId: vehicle.tokenId
      }));

    // only log if the user has vehicles
    if (vehicles.length > 0) {
      console.log(`Profile ${profile.id} has ${vehicles.length} vehicles`);
    }
    return { success: true, profile: profile.id, vehicles };
  } catch (error) {
    console.error(`Error processing profile ${profile.id}:`, error);
    return { success: false, profile: profile.id, error, vehicles: [] };
  }
}

async function main() {
  try {
    // Initialize DIMO client
    const dimoClient = DimoWrapper.getInstance();
    const supabase = GetSupabaseClient();

  
    // Get all profiles with connected wallets
    const { data: profiles, error } = await supabase
      .from('profiles_wallet')
      .select('*')
      .not('dimo_completed_wallet','is','null');

    if (error) {
      throw error;
    }

    console.log(`Found ${profiles.length} profiles with connected wallets`);

    // Process all profiles in parallel with a concurrency limit
    const BATCH_SIZE = 10; // Adjust this based on API rate limits
    const results = [];
    
    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      const batch = profiles.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(profile => processProfile(profile, dimoClient));
      
      console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(profiles.length / BATCH_SIZE)}`);
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Optional: Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < profiles.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Collect all non-zero profiles
    const nonZeroProfiles: UserAddressAndTokenId[] = results
      .filter(r => r.success && r.vehicles.length > 0)
      .flatMap(r => r.vehicles);

    console.log('\nNon-zero profiles:', nonZeroProfiles.length);
    
    // Write the profiles to a json file
    const json = JSON.stringify(nonZeroProfiles, null, 2);
    await fs.writeFile('out/nonZeroProfiles2.json', json);

    // Log summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\nProcessing Summary:');
    console.log(`Total profiles processed: ${results.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
      console.log('\nFailed profiles:');
      results
        .filter(r => !r.success)
        .forEach(r => console.log(`Profile ${r.profile}: ${r.error}`));
    }

  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });
