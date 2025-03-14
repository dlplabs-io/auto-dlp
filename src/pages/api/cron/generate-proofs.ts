import { NextApiRequest, NextApiResponse } from 'next';
import { FILES_TABLE, GetSupabaseClient } from '@/lib/supabase';
import fetch from 'node-fetch';
import { ENV } from '@/config/env';

// Define response type for the generate endpoint
interface GenerateResponse {
  fileId: string;
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Cron job to generate proofs for files
 * 
 * This function:
 * 1. Identifies files with status 'new' (no proof generated)
 * 2. Calls the generate endpoint for each file
 * 3. Processes files with rate limiting (1 per second)
 * 
 * Designed to be called by Vercel Cron Jobs on a regular schedule (e.g., every 5 minutes)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify this is a legitimate cron job request
  // In production, you would add authentication here
  
  console.log("Starting proof generation job");
  
  // Initialize services
  const supabase = GetSupabaseClient();
  
  try {
    // Find files that need proofs (status = 'new')
    const { data: pendingFiles, error } = await supabase
      .from(FILES_TABLE)
      .select('blockchainFileId')
      .eq('status', 'new')
      .limit(50); // Process in batches to avoid timeouts
    
    if (error) {
      console.error('Error fetching files:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
    
    if (!pendingFiles || pendingFiles.length === 0) {
      console.log("No files requiring proof generation found");
      return res.status(200).json({ message: 'No files to process' });
    }
    
    console.log(`Found ${pendingFiles.length} files that need proofs generated`);
    
    // Track results for reporting
    const results = {
      processed: pendingFiles.length,
      succeeded: 0,
      failed: 0
    };
    
    const baseUrl = ENV.APP_URL || 'http://localhost:3000';
    
    // Process each file with rate limiting (1 per second)
    for (const file of pendingFiles) {
      try {
        const fileId = file.blockchainFileId;
        
        console.log(`Generating proof for file ${fileId}`);
        
        // Call the generate endpoint for this file
        const response = await fetch(`${baseUrl}/api/files/${fileId}/generate`, {
          method: 'POST'
        });
        
        const data = await response.json() as GenerateResponse;
        
        if (!response.ok) {
          console.error(`Error generating proof for file ${fileId}:`, data);
          
          // Mark as failed and add failure reason
          await supabase
            .from(FILES_TABLE)
            .update({ 
              status: 'failed',
              failure_reason: data.error || 'Unknown error during proof generation'
            })
            .eq('blockchainFileId', fileId);
          
          results.failed++;
        } else {
          console.log(`Successfully generated proof for file ${fileId}`);
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
      message: 'Proof generation completed',
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Unexpected error in proof generation job:', error);
    return res.status(500).json({ 
      error: 'Unexpected error in proof generation job',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
