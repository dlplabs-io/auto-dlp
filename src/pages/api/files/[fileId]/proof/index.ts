import { NextApiRequest, NextApiResponse } from 'next';
import { FILES_TABLE, GetSupabaseClient } from '@/lib/supabase';

/**
 * API endpoint to fetch the verbose proof for a specific file
 * 
 * GET /api/files/{fileId}/proof
 * 
 * Returns the verbose proof data if it exists
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileId } = req.query;

  if (!fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'File ID is required' });
  }

  try {
    const supabase = GetSupabaseClient();

    // Query for the file using the blockchain file ID
    const { data: file, error } = await supabase
      .from(FILES_TABLE)
      .select('verbose_proof')
      .eq('blockchainFileId', fileId)
      .single();

    if (error) {
      console.error('Error fetching file:', error);
      return res.status(500).json({ error: 'Database query failed', details: error.message });
    }

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.verbose_proof) {
      return res.status(404).json({ error: 'Proof not found for this file' });
    }

    // Return the verbose proof
    return res.status(200).json(file.verbose_proof);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
