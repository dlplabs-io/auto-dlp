import { DimoWrapper } from '../src/lib/dimo';
import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();

interface UserAddressAndTokenId {
  address: string;
  tokenId: number;
}

async function processVehicle(vehicle: UserAddressAndTokenId, dimo: DimoWrapper) {
  try {
    const response = await dimo.checkPermissions(vehicle.tokenId);

    return { 
      success: true, 
      tokenId: vehicle.tokenId,
      address: vehicle.address,
      hasPermissions: response.hasAccess,
    };
  } catch (error) {
    console.error(`Error processing vehicle ${vehicle.tokenId}:`, error);
    return { 
      success: false, 
      tokenId: vehicle.tokenId,
      address: vehicle.address,
      error,
      hasPermissions: false,
    };
  }
}

async function main() {
  try {
    // Initialize DIMO client
    const dimoClient = DimoWrapper.getInstance();

    // Read the nonZeroProfiles.json file
    const fileContent = await fs.readFile('out/nonZeroProfiles2.json', 'utf-8');
    const profiles: UserAddressAndTokenId[] = JSON.parse(fileContent);

    console.log(`Found ${profiles.length} profiles to check permissions for`);

    // Process all profiles in parallel with a concurrency limit
    const BATCH_SIZE = 10;
    const results = [];
    
    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      const batch = profiles.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(profile => processVehicle(profile, dimoClient));
      
      console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(profiles.length / BATCH_SIZE)}`);
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < profiles.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Collect all successful results
    const profileResults = results.filter(r => r.success);

    console.log('\nTotal profiles:', profileResults.length);
    console.log('Profiles with permissions:', profileResults.filter(r => r.hasPermissions).length);
    console.log('Profiles without permissions:', profileResults.filter(r => !r.hasPermissions).length);
    
    // Write all results to json file
    const json = JSON.stringify(profileResults, null, 2);
    await fs.writeFile('out/profilePermissions.json', json);

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
        .forEach(r => console.log(`Profile ${r.tokenId}: ${r.error}`));
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
