import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { DATA_REGISTRY_ABI } from '@/contracts/DataRegistryABI';
import { GetSupabaseClient } from '@/lib/supabase';


/**
 * THIS FILE DEFINITELY DOESN"T WORK
 * @param req 
 * @param res 
 * @returns 
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { fileId } = req.query;
    const { accountAddress, permissionKey } = req.body;

    if (!fileId || !accountAddress || !permissionKey) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const contractAddress = process.env.DATA_REGISTRY_CONTRACT_ADDRESS;
    if (!contractAddress) {
        return res.status(500).json({ message: 'Contract address not configured' });
    }

    const walletPrivateKey = process.env.DLP_OPERATOR_PRIVATE_KEY;
    if (!walletPrivateKey) {
        return res.status(500).json({ message: 'Wallet private key not configured' });
    }
    
    const supabase = GetSupabaseClient();

    try {
        // Check if file exists
        const { data: file } = await supabase
            .from('files')
            .select('id')
            .eq('blockchainFileId', fileId.toString())
            .single();

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // // TODO: Check if permission already exists
        // const { data: existingPermission } = await supabase
        //     .from('FilePermissionfil')
        //     .select('id')
        //     .eq('fileId', file.id)
        //     .eq('accountAddress', accountAddress)
        //     .single();

        // if (existingPermission) {
        //     return res.status(400).json({ message: 'Permission already exists for this account' });
        // }

        // Initialize provider and contract
        const provider = new ethers.providers.JsonRpcProvider(
            process.env.RPC_ENDPOINT || 'https://rpc.moksha.vana.org'
        );
        const wallet = new ethers.Wallet(walletPrivateKey, provider);
        const contract = new ethers.Contract(contractAddress, DATA_REGISTRY_ABI, wallet);

        // Add permission to blockchain
        const tx = await contract.addFilePermission(
            fileId,
            accountAddress,
            permissionKey
        );
        await tx.wait();

        // TODO: tore permission in database
        // const { error: permissionError } = await supabase
        //     .from('FilePermission')
        //     .insert({
        //         fileId: file.id,
        //         accountAddress,
        //         permissionKey
        //     });

        // if (permissionError) {
        //     throw new Error(`Error storing permission: ${permissionError.message}`);
        // }

        return res.status(201).json({
            message: 'Permission added successfully',
            fileId: fileId.toString(),
            accountAddress
        });

    } catch (error) {
        console.error('Error adding permission:', error);
        
        if (error instanceof Error) {
            return res.status(500).json({ 
                message: 'Error adding permission',
                error: error.message 
            });
        }
        
        return res.status(500).json({ 
            message: 'Unknown error occurred while adding permission' 
        });
    }
}
