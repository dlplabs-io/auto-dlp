import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { generateProof } from '@/lib/proofGeneration';

/**
 * Debug endpoint that generates a proof for a specific file
 * 
 * This endpoint is for testing/debugging purposes only and:
 * 1. Takes a fileId as a path parameter
 * 2. Uses the DLP operator's private key to generate a proof
 * 3. Returns the complete proof result without storing it in the database
 * 
 * Unlike the proof endpoints, this one:
 * - Uses GET instead of POST
 * - Returns the full proof data directly in the response
 * - Does not update any database records
 * 
 * @param req - NextJS API request containing fileId as a path parameter
 * @param res - NextJS API response
 * @returns JSON response with the complete proof data or appropriate error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow GET requests for this debug endpoint
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Extract fileId from the path parameter
    const { fileId } = req.query;

    // Get the private key from environment variables
    const walletPrivateKey = process.env.DLP_OPERATOR_PRIVATE_KEY;
    if (!walletPrivateKey) {
        return res.status(500).json({ message: 'Wallet private key not configured' });
    }

    // Validate the fileId parameter
    if (!fileId) {
        return res.status(400).json({ message: 'FileId is required' });
    }

    try {
        // Initialize the blockchain provider
        const provider = new ethers.providers.JsonRpcProvider(
            process.env.RPC_ENDPOINT || 'https://rpc.moksha.vana.org'
        );

        // Create a wallet instance with the private key
        const wallet = new ethers.Wallet(walletPrivateKey, provider);

        // Generate proof with file details included
        // This calls the same proof generation function used by other endpoints
        const proofResult = await generateProof({ 
            fileId: fileId.toString(), 
            privateKey: wallet.privateKey
        });

        // Return the complete proof result for debugging
        return res.status(200).json({
            message: 'Debug proof generated',
            ...proofResult
        });

    } catch (error) {
        // Log the error for server-side debugging
        console.error('Error generating debug proof:', error);
        
        // Provide detailed error information when possible
        if (error instanceof Error) {
            return res.status(500).json({ 
                message: 'Error generating debug proof',
                error: error.message 
            });
        }

        // Fallback for unknown error types
        return res.status(500).json({ 
            message: 'Unknown error occurred while generating debug proof' 
        });
    }
}
