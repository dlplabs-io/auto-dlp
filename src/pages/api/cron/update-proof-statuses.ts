import { NextApiRequest, NextApiResponse } from 'next';
import { FILES_TABLE, GetSupabaseClient } from '@/lib/supabase';
import fetch from 'node-fetch';

// Define the response type from the update-status endpoint
interface UpdateStatusResponse {
  fileId: string;
  status: 'confirmed' | 'failed' | 'pending' | 'not_submitted';
  transactionHash?: string;
  isOnchain: boolean;
  message: string;
  taskId?: string;
  taskState?: string;
  error?: string;
  updatedAt?: string;
}

/**
 * Cron job to update proof submission statuses
 * 
 * This function:
 * 1. Queries for files that have been submitted but not confirmed on-chain
 * 2. Calls the update-status endpoint for each file to check and update its status
 * 3. Aggregates results and returns a summary
 * 
 * Designed to be called by Vercel Cron Jobs on a regular schedule (e.g., every 10 minutes)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify this is a legitimate cron job request
  // In production, you would add authentication here
  // For example, checking for a secret header that only Vercel would know
  
  console.log("Starting proof status update job");
  
  // Initialize services
  const supabase = GetSupabaseClient();
  
  try {
    // Query for pending submissions (have relay_url and submission_status='pending')
    const { data: pendingFiles, error } = await supabase
      .from(FILES_TABLE)
      .select('blockchainFileId')
      .not('relay_url', 'is', null)
      .eq('submission_status', 'pending')
      .limit(50); // Process in batches to avoid timeouts
    
    if (error) {
      console.error('Error fetching pending files:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
    
    if (!pendingFiles || pendingFiles.length === 0) {
      console.log("No pending proof submissions found");
      return res.status(200).json({ message: 'No pending submissions to process' });
    }
    
    console.log(`Found ${pendingFiles.length} pending proof submissions to check`);
    
    // Track results for reporting
    const results = {
      processed: pendingFiles.length,
      succeeded: 0,
      failed: 0,
      stillPending: 0,
      errors: 0
    };
    
    // Process each pending file by calling the update-status endpoint
    const updatePromises = pendingFiles.map(async (file) => {
      try {
        const fileId = file.blockchainFileId;
        
        // Skip files without a blockchain file ID
        if (!fileId) {
          console.warn(`File has no blockchainFileId, skipping`);
          return;
        }
        
        console.log(`Checking status for file ${fileId}`);
        
        // Determine the base URL based on environment
        // In production, this would be your deployed URL
        // For local development, use localhost
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000';
        
        // Call the update-status endpoint for this file
        const response = await fetch(`${baseUrl}/api/files/${fileId}/update-status`);
        const data = await response.json() as UpdateStatusResponse;
        
        if (!response.ok) {
          console.error(`Error updating status for file ${fileId}:`, data);
          results.errors++;
          return;
        }
        
        // Update our results based on the status
        if (data.status === 'confirmed') {
          console.log(`Successfully confirmed file ${fileId} with transaction hash ${data.transactionHash}`);
          results.succeeded++;
        } else if (data.status === 'failed') {
          console.warn(`File ${fileId} failed with status: ${data.taskState || 'unknown'}`);
          results.failed++;
        } else if (data.status === 'pending') {
          console.log(`File ${fileId} is still pending with status: ${data.taskState || 'processing'}`);
          results.stillPending++;
        }
      } catch (error) {
        console.error(`Error processing file:`, error);
        results.errors++;
      }
    });
    
    // Wait for all update operations to complete
    await Promise.all(updatePromises);
    
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
