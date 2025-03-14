import { NextApiRequest, NextApiResponse } from 'next';
import { FILES_TABLE, GetSupabaseClient } from '@/lib/supabase';
import fetch from 'node-fetch';
import { ENV } from '@/config/env';

// Define response type for the submit endpoint
interface SubmitResponse {
  message?: string;
  fileId?: string;
  taskId?: string;
  error?: string;
}

/**
 * Cron job to submit proofs to the blockchain
 * 
 * This function:
 * 1. Identifies files with status 'proof_generated' (proof ready for submission)
 * 2. Calls the submit endpoint for each file to submit the proof to the blockchain
 * 3. Processes files with rate limiting (1 per second)
 * 
 * Designed to be called by Vercel Cron Jobs on a regular schedule (e.g., every 5 minutes)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify this is a legitimate cron job request
  // In production, you would add authentication here
  
  console.log("Starting proof submission job");
  
  // Initialize services
  const supabase = GetSupabaseClient();
  
  try {
    // Find files with generated proofs ready for submission
    const { data: readyFiles, error } = await supabase
      .from(FILES_TABLE)
      .select('blockchainFileId')
      .eq('status', 'proof_generated')
      .limit(50); // Process in batches to avoid timeouts
    
    if (error) {
      console.error('Error fetching files:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
    
    if (!readyFiles || readyFiles.length === 0) {
      console.log("No files ready for proof submission found");
      return res.status(200).json({ message: 'No files to submit' });
    }
    
    console.log(`Found ${readyFiles.length} files with proofs ready for submission`);
    
    // Track results for reporting
    const results = {
      processed: readyFiles.length,
      succeeded: 0,
      failed: 0
    };
    
    const baseUrl = ENV.APP_URL || 'http://localhost:3000';
    
    // Process each file with rate limiting (1 per second)
    for (const file of readyFiles) {
      try {
        const fileId = file.blockchainFileId;
        
        console.log(`Submitting proof for file ${fileId} to blockchain`);
        
        // Call the submit endpoint for this file
        const response = await fetch(`${baseUrl}/api/files/${fileId}/submit`, {
          method: 'POST'
        });
        
        const data = await response.json() as SubmitResponse;
        
        if (!response.ok) {
          console.error(`Error submitting proof for file ${fileId}:`, data);
          
          // Mark as failed and add failure reason
          await supabase
            .from(FILES_TABLE)
            .update({ 
              status: 'failed',
              failure_reason: data.error || 'Unknown error during blockchain submission'
            })
            .eq('blockchainFileId', fileId);
          
          results.failed++;
        } else {
          console.log(`Successfully initiated proof submission for file ${fileId}`);
          results.succeeded++;
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
      message: 'Proof submission completed',
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Unexpected error in proof submission job:', error);
    return res.status(500).json({ 
      error: 'Unexpected error in proof submission job',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
