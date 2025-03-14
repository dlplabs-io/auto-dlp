import { NextApiRequest, NextApiResponse } from 'next';
import { FILES_TABLE, GetSupabaseClient } from '@/lib/supabase';
import { ENV } from '@/config/env';
import fetch from 'node-fetch';

// Define the response type from the update-status endpoint
interface UpdateStatusResponse {
  fileId: string;
  status: string;
  isOnchain: boolean;
  message: string;
  taskId?: string;
  transactionHash?: string;
}

/**
 * Cron job to update the status of pending proof submissions
 * 
 * This function:
 * 1. Identifies files with status 'pending'
 * 2. Calls the update-status endpoint for each file
 * 3. Updates the database based on the response
 * 
 * Designed to be called by Vercel Cron Jobs on a regular schedule (e.g., every 5 minutes)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify this is a legitimate cron job request
  // In production, you would add authentication here
  
  console.log("Starting proof status update job");
  
  // Initialize services
  const supabase = GetSupabaseClient();
  
  try {
    // Query for pending submissions (have relay_url and status='pending')
    const { data: pendingFiles, error } = await supabase
      .from(FILES_TABLE)
      .select('blockchainFileId')
      .eq('status', 'pending')
      .limit(50); // Process in batches to avoid timeouts
    
    if (error) {
      console.error('Error fetching files:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
    
    if (!pendingFiles || pendingFiles.length === 0) {
      console.log("No pending proof submissions found");
      return res.status(200).json({ message: 'No pending submissions to update' });
    }
    
    console.log(`Found ${pendingFiles.length} pending proof submissions to check`);
    
    // Track results for reporting
    const results = {
      processed: pendingFiles.length,
      confirmed: 0,
      stillPending: 0,
      failed: 0
    };
    
    // Normalize the base URL to ensure it doesn't have a trailing slash
    const baseUrl = (ENV.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
    
    // Process each file with rate limiting (1 per second)
    for (const file of pendingFiles) {
      try {
        const fileId = file.blockchainFileId;
        
        console.log(`Checking status for file ${fileId}`);
        console.log(`Calling ${baseUrl}/api/files/${fileId}/update-status`);
        
        // Call the update-status endpoint for this file
        const response = await fetch(`${baseUrl}/api/files/${fileId}/update-status`);
        
        // Log the response status and headers for debugging
        console.log(`Response status: ${response.status}`);
        console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
        
        // Check if response is OK before trying to parse JSON
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error updating status for file ${fileId}: Status ${response.status}, Response:`, errorText);
          results.failed++;
          continue;
        }
        
        // Parse the JSON response
        const data = await response.json() as UpdateStatusResponse;
        
        // Update tracking based on the status
        if (data.status === 'confirmed') {
          console.log(`Proof for file ${fileId} is confirmed on blockchain`);
          results.confirmed++;
        } else if (data.status === 'failed') {
          console.log(`Proof submission for file ${fileId} failed: ${data.message}`);
          results.failed++;
        } else {
          console.log(`Proof submission for file ${fileId} is still pending`);
          results.stillPending++;
        }
        
        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing file:`, error);
        results.failed++;
      }
    }
    
    // Return summary
    return res.status(200).json({
      message: 'Proof status update completed',
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Unexpected error in proof status update job:', error);
    return res.status(500).json({ 
      error: 'Unexpected error in proof status update job',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
