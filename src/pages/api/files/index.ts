import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { DATA_REGISTRY_ABI } from '@/contracts/DataRegistryABI';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { url, ownerAddress } = req.body;

    if (!url || !ownerAddress) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const contractAddress = process.env.DATA_REGISTRY_CONTRACT_ADDRESS;
    if (!contractAddress) {
        return res.status(500).json({ message: 'Contract address not configured' });
    }

    const walletPrivateKey = process.env.DATA_REGISTRY_WALLET_PRIVATE_KEY;
    if (!walletPrivateKey) {
        return res.status(500).json({ message: 'Wallet private key not configured' });
    }

    try {
        // Check if file already exists
        const { data: existingFile } = await supabase
            .from('files')
            .select('id')
            .eq('url', url)
            .single();

        if (existingFile) {
            return res.status(400).json({ message: 'File already exists' });
        }

        // Initialize provider and contract
        const provider = new ethers.providers.JsonRpcProvider(
            process.env.RPC_ENDPOINT || 'https://rpc.moksha.vana.org'
        );
        const wallet = new ethers.Wallet(walletPrivateKey, provider);
        const contract = new ethers.Contract(contractAddress, DATA_REGISTRY_ABI, wallet);

        // Add file to blockchain
        const tx = await contract.addFile(url, ownerAddress);
        const receipt = await tx.wait();

        // Get the file ID from the event logs
        const event = receipt.events?.find(e => e.event === 'FileAdded');
        if (!event) {
            throw new Error('File added but no FileAdded event found');
        }
        const blockchainFileId = event.args.fileId.toString();

        // Get owner profile if exists
        supabase.from("profiles").select('id').eq('connected_wallet', ownerAddress).single();

        const { data: ownerProfile } = await supabase
            .from('Profile')
            .select('id')
            .eq('walletAddress', ownerAddress)
            .single();

        // Store file in database
        const { data: file, error: insertError } = await supabase
            .from('File')
            .insert({
                blockchainFileId,
                url,
                ownerAddress,
                ownerId: ownerProfile?.id || null
            })
            .select()
            .single();

        if (insertError) {
            throw new Error(`Error storing file: ${insertError.message}`);
        }

        return res.status(201).json({
            message: 'File created successfully',
            fileId: blockchainFileId,
            file
        });

    } catch (error) {
        console.error('Error creating file:', error);
        
        if (error instanceof Error) {
            return res.status(500).json({ 
                message: 'Error creating file',
                error: error.message 
            });
        }
        
        return res.status(500).json({ 
            message: 'Unknown error occurred while creating file' 
        });
    }
}
