import dotenv from 'dotenv';
dotenv.config();

import { GetSupabaseClient } from '@/lib/supabase';
import { DimoWrapper } from '../src/lib/dimo';
import fs from 'fs/promises';

interface VehicleResult {
  walletAddress: string;
  tokenId: number;
  hasPermissions: boolean;
  success: boolean;
  error?: any;
}

interface ProfileResult {
  walletAddress: string;
  hasConnectedVehicles: boolean;
  vehicles: VehicleResult[];
}

async function processVehicle(walletAddress: string, tokenId: number, dimoClient: DimoWrapper): Promise<VehicleResult> {
  try {
    const response = await dimoClient.checkPermissions(tokenId);
    return {
      walletAddress,
      tokenId,
      hasPermissions: response.hasAccess,
      success: true
    };
  } catch (error) {
    console.error(`Error checking permissions for vehicle ${tokenId}:`, error);
    return {
      walletAddress,
      tokenId,
      hasPermissions: false,
      success: false,
      error
    };
  }
}

async function processWallet(dimoWallet: string, connectedWallet: string, dimoClient: DimoWrapper): Promise<ProfileResult> {
  try {
    const response = await dimoClient.getVehicles(dimoWallet);
    const vehicles = response.vehicles.filter(vehicle => vehicle.tokenId !== 0);
    
    // Process each vehicle to check permissions
    const vehicleResults = await Promise.all(
      vehicles.map(vehicle => processVehicle(dimoWallet, vehicle.tokenId, dimoClient))
    );

    return {
      walletAddress: connectedWallet,
      hasConnectedVehicles: vehicles.length > 0,
      vehicles: vehicleResults
    };
  } catch (error) {
    console.error(`Error processing wallet ${dimoWallet}:`, error);
    return {
      walletAddress: connectedWallet,
      hasConnectedVehicles: false,
      vehicles: []
    };
  }
}

async function main() {
  try {
    // Initialize clients
    const dimoClient = DimoWrapper.getInstance();
    const supabase = GetSupabaseClient();

    // Query files-old and join with profiles-wallet
    const { data: profiles, error } = await supabase
      .from('files-old')
      .select(`
        *,
        profiles_wallet!inner(
          dimo_completed_wallet,
          connected_wallet
        )
      `)
      .filter('is_onchain', 'eq', false)
      // .filter('proof->data->score', 'gt', 0.5);

    if (error) {
      throw error;
    }

    console.log(`Found ${profiles.length} off-chain files to process`);

    // Process all wallets
    const results = await Promise.all(
      profiles.map(profile => 
        processWallet(profile.profiles_wallet.dimo_completed_wallet!, profile.profiles_wallet.connected_wallet!, dimoClient)
      )
    );

    // Generate summary
    const summary = {
      totalProfiles: results.length,
      profilesWithVehicles: results.filter(r => r.hasConnectedVehicles).length,
      totalVehicles: results.reduce((acc, r) => acc + r.vehicles.length, 0),
      vehiclesWithPermissions: results.reduce((acc, r) => 
        acc + r.vehicles.filter(v => v.hasPermissions).length, 0
      ),
      results
    };

    // Write results to file
    await fs.writeFile(
      'out/offchain_vehicle_permissions.json', 
      JSON.stringify(summary, null, 2)
    );

    console.log('\nSummary:');
    console.log(`Total Profiles Processed: ${summary.totalProfiles}`);
    console.log(`Profiles with Vehicles: ${summary.profilesWithVehicles}`);
    console.log(`Total Vehicles: ${summary.totalVehicles}`);
    console.log(`Vehicles with Permissions: ${summary.vehiclesWithPermissions}`);
    console.log('\nFull results written to out/offchain_vehicle_permissions.json');

  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });
