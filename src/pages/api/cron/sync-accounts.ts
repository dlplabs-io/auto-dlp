import { NextApiRequest, NextApiResponse } from 'next';
import { ACCOUNTS_TABLE, GetSupabaseClient } from '@/lib/supabase';
import fetch from 'node-fetch';
import { ENV } from '@/config/env';

/**
 * Cron job to sync accounts that don't have files
 * 
 * This function:
 * 1. Identifies accounts that don't have a file_sync_status of 'synced' and dataregistry_url not null
 * 2. Calls the sync endpoint for each account to populate files
 * 3. Updates the account's file_sync_status on success or failure
 * 
 * Designed to be called by Vercel Cron Jobs on a regular schedule (e.g., every 15 minutes)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify this is a legitimate cron job request
  // In production, you would add authentication here
  
  console.log("Starting account sync job");
  
  // Initialize services
  const supabase = GetSupabaseClient();
  
  try {
    // Find accounts without files (not synced and have a dataregistry_url)
    const { data: accountsToSync, error } = await supabase
      .from(ACCOUNTS_TABLE)
      .select('public_id')
      .eq('file_sync_status', 'not_synced')
      .not('dataregistry_url', 'is', null)
      .limit(50); // Process in batches
    
    if (error) {
      console.error('Error fetching accounts:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
    
    if (!accountsToSync || accountsToSync.length === 0) {
      console.log("No accounts to sync found");
      return res.status(200).json({ message: 'No accounts to sync' });
    }
    
    console.log(`Found ${accountsToSync.length} accounts to sync`);
    
    // Track results for reporting
    const results = {
      processed: accountsToSync.length,
      succeeded: 0,
      failed: 0
    };
    
    // Process each account by calling the sync endpoint
    const syncPromises = accountsToSync.map(async (account) => {
      try {
        const accountId = account.public_id;
        
        console.log(`Syncing account ${accountId}`);
        
        // Normalize the base URL to ensure it doesn't have a trailing slash
        const baseUrl = (ENV.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
        
        // Call the sync endpoint for this account
        console.log(`Calling ${baseUrl}/api/files/sync`);
        const response = await fetch(`${baseUrl}/api/files/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountIds: [accountId] })
        });
        
        // Log the response status and headers for debugging
        console.log(`Response status: ${response.status}`);
        console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
        
        // Check if response is OK before trying to parse JSON
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error syncing account ${accountId}: Status ${response.status}, Response:`, errorText);
          
          // Mark account as failed
          await supabase
            .from(ACCOUNTS_TABLE)
            .update({ file_sync_status: 'failed' })
            .eq('public_id', accountId);
          
          results.failed++;
          return;
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Mark account as synced
        await supabase
          .from(ACCOUNTS_TABLE)
          .update({ file_sync_status: 'synced' })
          .eq('public_id', accountId);
        
        console.log(`Successfully synced account ${accountId}`);
        results.succeeded++;
      } catch (error) {
        console.error(`Error processing account:`, error);
        results.failed++;
      }
    });
    
    // Wait for all sync operations to complete
    await Promise.all(syncPromises);
    
    // Return summary
    return res.status(200).json({
      message: 'Account sync completed',
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Unexpected error in account sync job:', error);
    return res.status(500).json({ 
      error: 'Unexpected error in account sync job',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
