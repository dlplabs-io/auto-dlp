import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { fileId } = req.query;

    if (!fileId) {
        return res.status(400).json({ message: 'File ID is required' });
    }

    try {
        // Get file with owner profile information
        const { data: file, error: fileError } = await supabase
            .from('files')
            .select(`
                *,
                owner:profiles_wallet (
                    public_id,
                    connected_wallet,
                    dimo_completed_value
                )
            `)
            .eq('blockchainFileId', fileId.toString())
            .single();

        if (fileError) {
            throw new Error(`Error fetching file: ${fileError.message}`);
        }

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Format the response
        return res.status(200).json({
            id: file.blockchainFileId,
            url: file.url,
            ownerAddress: file.owner?.connected_wallet,
            ownerPublicId: file.owner?.public_id || null,
            hasCompletedDimo: file.owner?.dimo_completed_value || false,
            createdAt: file.createdAt
        });

    } catch (error) {
        console.error('Error fetching file details:', error);
        
        if (error instanceof Error) {
            return res.status(500).json({ 
                message: 'Error fetching file details',
                error: error.message 
            });
        }
        
        return res.status(500).json({ 
            message: 'Unknown error occurred while fetching file details' 
        });
    }
}
