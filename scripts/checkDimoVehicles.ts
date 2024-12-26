import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/supabase';
import { DimoWrapper } from '../src/lib/dimo';
import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();

type UserAddressAndTokenId = {
  address: string;
  tokenId: number;
};

async function main() {
  try {
    // Initialize DIMO client
    const dimoClient = DimoWrapper.getInstance();

    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  
    // Get all profiles with connected wallets
    const { data: profiles, error } = await supabase
      .from('profiles_wallet')
      .select('*')
      .not('dimo_completed_wallet','is','null');

    if (error) {
      throw error;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found with connected wallets');
      return;
    }

    console.log(`Found ${profiles.length} profiles with connected wallets`);

    // Process each profile
    let nonZeroProfiles: UserAddressAndTokenId[]= []

    for (const profile of profiles) {
      try {
        // console.log(`\nChecking vehicles for profile ${profile.dimo_completed_wallet}:`);
        if (!profile.dimo_completed_wallet) {
          console.log('No DIMO wallet found, skipping');
          continue;
        }

        const response = await dimoClient.getVehicles(profile.dimo_completed_wallet);
        const vehicleCount = response.vehicles.length;
        
        if (vehicleCount > 0) {
          for (const vehicle of response.vehicles) {
            nonZeroProfiles.push({
              address: profile.dimo_completed_wallet,
              tokenId: vehicle.tokenId
            })
          }
          // Update profile with DIMO completion status if they have vehicles
          // const { error: updateError } = await supabase
          //   .from('profiles')
          //   .update({
          //     dimo_completed_at: new Date().toISOString(),
          //     dimo_completed_wallet: profile.connected_wallet,
          //     dimo_completed_value: vehicleCount.toString()
          //   })
          //   .eq('public_id', profile.public_id);

          // if (updateError) {
          //   console.error('Error updating profile:', updateError);
          // } else {
          //   console.log('Successfully updated profile DIMO status');
          // }
          // console.log(`Profile ${profile.public_id} has DIMO vehicles: ${vehicleCount}`);
        }
      } catch (err) {
        console.error(`Error processing profile ${profile.public_id}:`, err);
        // Continue with next profile
        continue;
      }
    }


    console.log('\nNon-zero profiles:', nonZeroProfiles.length);
    // write the profiles to a json
    const json = JSON.stringify(nonZeroProfiles, null, 2);
    await fs.writeFile('out/nonZeroProfiles2.json', json);


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
