import { NextApiRequest, NextApiResponse } from 'next';
import { GelatoRelay } from '@gelatonetwork/relay-sdk-viem';
import { FILES_TABLE, GetSupabaseClient } from '@/lib/supabase';
import { gelatoRelayParams } from '@/lib/gelato';

import { ENV } from '@/config/env';

/**
 * Updates the status of a proof submission for a specific file
 * 
 * This endpoint:
 * 1. Takes a fileId as a path parameter
 * 2. Checks the Gelato relay service for the current status of the submission
 * 3. Updates the database record if the proof has been successfully submitted to the blockchain
 * 
 * Path Parameters:
 * - fileId: Blockchain file ID (required)
 * 
 * @param req - NextJS API request with fileId as path parameter
 * @param res - NextJS API response
 * @returns JSON response with current status or appropriate error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract fileId from the path parameter
  const { fileId } = req.query;

  // Validate the fileId parameter
  if (!fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'fileId is required in the path' });
  }

  const supabase = GetSupabaseClient();

  try {
    // Get file with relay information
    const { data: file, error: fileError } = await supabase
      .from(FILES_TABLE)
      .select('*')
      .eq('blockchainFileId', fileId)
      .single();

    if (fileError) {
      throw new Error(`Error fetching file: ${fileError.message}`);
    }

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // If file is already marked as on-chain, return current status
    if (file.is_onchain && file.proof_txn) {
      return res.status(200).json({ 
        fileId: file.blockchainFileId,
        status: 'confirmed',
        transactionHash: file.proof_txn,
        isOnchain: true,
        message: 'Proof already confirmed on blockchain',
        updatedAt: new Date().toISOString() // Use current time since we don't have updated_at
      });
    }

    // If submission_status is 'failed', return the failure status
    if (file.submission_status === 'failed') {
      return res.status(200).json({
        fileId: file.blockchainFileId,
        status: 'failed',
        isOnchain: false,
        message: 'Proof submission previously failed',
        taskId: file.relay_url?.split('/').pop(),
        submissionStatus: file.submission_status
      });
    }

    // If no relay URL, the file hasn't been submitted yet
    if (!file.relay_url) {
      return res.status(200).json({ 
        fileId: file.blockchainFileId,
        status: 'not_submitted',
        isOnchain: false,
        message: 'Proof has not been submitted yet'
      });
    }

    // Extract task ID from relay URL
    const taskId = file.relay_url.split('/').pop();
    if (!taskId) {
      return res.status(400).json({ 
        error: 'Invalid relay URL format',
        relayUrl: file.relay_url
      });
    }

    // Check status with Gelato
    const relay = new GelatoRelay(gelatoRelayParams);
    const status = await relay.getTaskStatus(taskId);
    
    // If task is successful, update the database
    if (status?.taskState === 'ExecSuccess' && status.transactionHash) {
      // Update database with success
      const { error: updateError } = await supabase
        .from(FILES_TABLE)
        .update({
          proof_txn: status.transactionHash,
          is_onchain: true,
          updated_at: new Date().toISOString(),
          submission_status: 'confirmed'
        })
        .eq('id', file.id);
        
      if (updateError) {
        return res.status(500).json({ 
          error: 'Error updating file status',
          details: updateError.message
        });
      }

      return res.status(200).json({
        fileId: file.blockchainFileId,
        status: 'confirmed',
        transactionHash: status.transactionHash,
        isOnchain: true,
        message: 'Proof confirmed on blockchain',
        taskId: taskId,
        taskState: status.taskState ? String(status.taskState) : undefined,
        updatedAt: new Date().toISOString(),
        submissionStatus: 'confirmed'
      });
    } 
    
    // If task failed, return the failure status and update the database
    if (status?.taskState && ['ExecReverted', 'Cancelled', 'Blacklisted'].includes(String(status.taskState))) {
      // Update database to mark as failed
      const { error: updateError } = await supabase
        .from(FILES_TABLE)
        .update({
          updated_at: new Date().toISOString(),
          submission_status: 'failed',
          failure_reason: String(status.taskState)
        })
        .eq('id', file.id);
        
      if (updateError) {
        console.error(`Error updating file status to failed:`, updateError);
      }
      
      return res.status(200).json({
        fileId: file.blockchainFileId,
        status: 'failed',
        isOnchain: false,
        message: `Proof submission failed with status: ${status.taskState}`,
        taskId: taskId,
        taskState: status.taskState ? String(status.taskState) : undefined,
        error: 'Transaction failed',
        submissionStatus: 'failed'
      });
    }
    
    // Otherwise, the task is still pending
    return res.status(200).json({
      fileId: file.blockchainFileId,
      status: 'pending',
      isOnchain: false,
      message: 'Proof submission is still pending',
      taskId: taskId,
      taskState: status?.taskState ? String(status.taskState) : undefined,
      submissionStatus: file.submission_status || 'pending'
    });

  } catch (error) {
    console.error('Error updating proof status:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Error updating proof status',
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Unknown error occurred while updating proof status' 
    });
  }
}
