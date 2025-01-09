import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { generateProof } from '@/lib/proofGeneration';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { fileId } = req.query;

    const walletPrivateKey = process.env.DLP_OPERATOR_PRIVATE_KEY;
    if (!walletPrivateKey) {
        return res.status(500).json({ message: 'Wallet private key not configured' });
    }

    if (!fileId) {
        return res.status(400).json({ message: 'FileId is required' });
    }

    try {
        const provider = new ethers.providers.JsonRpcProvider(
            process.env.RPC_ENDPOINT || 'https://rpc.moksha.vana.org'
        );

        const wallet = new ethers.Wallet(walletPrivateKey, provider);

        // Generate proof with file details included
        const proofResult = await generateProof({ 
            fileId: fileId.toString(), 
            privateKey: wallet.privateKey
        });

        return res.status(200).json({
            message: 'Debug proof generated',
            ...proofResult
        });

    } catch (error) {
        console.error('Error generating debug proof:', error);
        
        if (error instanceof Error) {
            return res.status(500).json({ 
                message: 'Error generating debug proof',
                error: error.message 
            });
        }

        return res.status(500).json({ 
            message: 'Unknown error occurred while generating debug proof' 
        });
    }
}
