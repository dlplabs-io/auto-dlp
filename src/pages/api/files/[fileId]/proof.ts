import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { DATA_REGISTRY_ABI } from '@/contracts/DataRegistryABI';
import { generateProof, validateAndGetFile } from '@/lib/proofGeneration';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { fileId } = req.query;
    if (!fileId || typeof fileId !== 'string') {
        return res.status(400).json({ message: 'File ID is required' });
    }

    const contractAddress = process.env.DATAREGISTRY_CONTRACT_ADDRESS;
    if (!contractAddress) {
        return res.status(500).json({ message: 'Contract address not configured' });
    }

    const walletPrivateKey = process.env.DATA_REGISTRY_WALLET_PRIVATE_KEY;
    if (!walletPrivateKey) {
        return res.status(500).json({ message: 'Wallet private key not configured' });
    }

    try {
        // Create provider and wallet
        const provider = new ethers.providers.JsonRpcProvider(
            process.env.RPC_ENDPOINT || 'https://rpc.moksha.vana.org'
        );
        const wallet = new ethers.Wallet(walletPrivateKey, provider);

        // Create contract instance
        const contract = new ethers.Contract(
            contractAddress,
            DATA_REGISTRY_ABI,
            wallet
        );

        // This will throw if file doesn't exist or already has a proof
        const file = await validateAndGetFile(fileId);

        // Generate proof
        const { signedProof } = await generateProof({
            fileId,
            wallet,
            includeFile: false
        });

        // Submit proof to blockchain
        const tx = await contract.submitProof(fileId, signedProof);
        const receipt = await tx.wait();

        // Update file in database with proof
        const { error: updateError } = await supabase
            .from('files')
            .update({ proof: JSON.stringify(signedProof) })
            .eq('blockchainFileId', fileId);

        if (updateError) {
            throw new Error('Failed to update file with proof');
        }

        return res.status(200).json({
            message: 'Proof generated and submitted successfully',
            fileId,
            signature: signedProof.signature,
            transactionHash: receipt.transactionHash
        });

    } catch (error) {
        console.error('Error generating proof:', error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Unknown error occurred' });
    }
}
