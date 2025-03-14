import type { NextApiRequest, NextApiResponse } from 'next';
import { ACCOUNTS_TABLE, FILES_TABLE, GetSupabaseClient } from '@/lib/supabase';

/**
 * Retrieves detailed information about a specific file by its blockchain file ID from the files table
 * 
 * This endpoint:
 * 1. Fetches the file record from the files table using the blockchain file ID
 * 2. Joins with the accounts table to include owner information
 * 3. Returns formatted file details including ownership information
 * 
 * @param req - NextJS API request containing fileId as a path parameter
 * @param res - NextJS API response
 * @returns JSON response with file details or appropriate error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow GET requests for this endpoint
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Extract fileId from the path parameter
    const { fileId } = req.query;

    // Validate the fileId parameter
    if (!fileId) {
        return res.status(400).json({ message: 'File ID is required' });
    }

    const supabase = GetSupabaseClient();

    try {
        // Get file with owner profile information
        // This performs a join between the files table and accounts table
        const { data: file, error: fileError } = await supabase
            .from(FILES_TABLE)
            .select(`
                *,
                owner:${ACCOUNTS_TABLE} (
                    public_id,
                    connected_wallet,
                    dimo_wallet,
                    dimo_token
                )
            `)
            .eq('blockchainFileId', fileId.toString())
            .single();

        if (fileError) {
            throw new Error(`Error fetching file: ${fileError.message}`);
        }

        // Return 404 if no file is found with the given ID
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Format the response to include only the necessary information
        // This transforms the database model into a client-friendly API response
        return res.status(200).json({
            id: file.blockchainFileId,
            url: file.url,
            ownerAddress: file.owner?.connected_wallet,
            ownerPublicId: file.owner?.public_id || null,
            hasCompletedDimo: file.owner?.dimo_token || false,
            createdAt: file.created_at
        });

    } catch (error) {
        console.error('Error fetching file details:', error);
        
        // Provide more detailed error information when possible
        if (error instanceof Error) {
            return res.status(500).json({ 
                message: 'Error fetching file details',
                error: error.message 
            });
        }
        
        // Fallback for unknown error types
        return res.status(500).json({ 
            message: 'Unknown error occurred while fetching file details' 
        });
    }
}
