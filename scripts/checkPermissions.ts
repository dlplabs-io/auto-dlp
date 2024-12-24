import { DimoWrapper } from '../src/lib/dimo';
import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();

type UserAddressAndTokenId = {
  address: string;
  tokenId: number;
};

type PermissionResult = UserAddressAndTokenId & {
  hasAccess: boolean;
};

async function main() {
  try {
    // Initialize DIMO client
    const dimoClient = DimoWrapper.getInstance();

    // Read the nonZeroProfiles.json file
    const fileContent = await fs.readFile('nonZeroProfiles.json', 'utf-8');
    const profiles: UserAddressAndTokenId[] = JSON.parse(fileContent);

    console.log(`Found ${profiles.length} profiles to check permissions for`);

    const permissionResults: PermissionResult[] = [];

    // Process each profile
    for (const profile of profiles) {
      try {
        console.log(`\nChecking permissions for wallet ${profile.address} and token ${profile.tokenId}`);
        
        const permissions = await dimoClient.checkPermissions(profile.address, profile.tokenId);
        
        permissionResults.push({
          ...profile,
          hasAccess: permissions.hasAccess
        });

        console.log(`Permission check result: ${permissions.hasAccess}`);
      } catch (err) {
        console.error(`Error checking permissions for profile ${profile.address}:`, err);
        // Add to results with hasAccess: false in case of error
        permissionResults.push({
          ...profile,
          hasAccess: false
        });
        // Continue with next profile
        continue;
      }
    }

    // Write results to permissions.json
    const json = JSON.stringify(permissionResults, null, 2);
    await fs.writeFile('out/permissions.json', json);

    console.log('\nResults summary:');
    console.log(`Total profiles checked: ${permissionResults.length}`);
    console.log(`Profiles with access: ${permissionResults.filter(p => p.hasAccess).length}`);
    console.log(`Profiles without access: ${permissionResults.filter(p => !p.hasAccess).length}`);

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
