import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { DATA_REGISTRY_ABI } from '@/contracts/DataRegistryABI';
import { GetSupabaseClient } from '@/lib/supabase';
import { randomUUID } from 'crypto';
import { ACCOUNTS_TABLE, FILES_TABLE } from '@/lib/supabase';

/**
 * Submits a file record to VANA. should be done through the UI and the relayer (unused)
 * 
 * This endpoint:
 * 1. Validates the file URL and owner address from the request body
 * 2. Checks if the file already exists in the database
 * 3. Verifies the owner account exists in the accounts table
 * 4. Adds the file to the VANA data registry smart contract
 * 5. Stores the file details in the database with the blockchain file ID
 * 
 * Request Body:
 * - url: URL of the file to register (required)
 * - ownerAddress: Ethereum address of the file owner (required)
 * 
 * @param req - NextJS API request with file data in the body
 * @param res - NextJS API response
 * @returns JSON response with created file details or appropriate error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests for this endpoint
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Extract required fields from request body
    const { url, ownerAddress } = req.body;

    // Validate required fields
    if (!url || !ownerAddress) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate environment configuration
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
        // Check if file already exists
        const { data: existingFile } = await supabase
            .from(FILES_TABLE)
            .select('id')
            .eq('url', url)
            .single();

        if (existingFile) {
            return res.status(400).json({ message: 'File already exists' });
        }

        // Check if account exists
        const account = await supabase.from(ACCOUNTS_TABLE).select('*').eq('connected_wallet', ownerAddress).single();
        if (!account.data) {
            return res.status(400).json({ message: 'account not found' });
        }

        // Initialize provider and contract
        const provider = new ethers.providers.JsonRpcProvider(
            process.env.RPC_ENDPOINT || 'https://rpc.moksha.vana.org'
        );
        const wallet = new ethers.Wallet(walletPrivateKey, provider);
        const contract = new ethers.Contract(contractAddress, DATA_REGISTRY_ABI, wallet);

        // Add file to DLP registry
        const tx = await contract.addFile(url, ownerAddress);
        const receipt = await tx.wait();

        // Get the file ID from the event logs
        const event = receipt.events?.find((e: { event: string; }) => e.event === 'FileAdded');
        if (!event) {
            throw new Error('File added but no FileAdded event found');
        }

        const blockchainFileId = event.args.fileId.toString();

        // Store file in database
        const { data: file, error: insertError } = await supabase
            .from('files')
            .insert({
                id: randomUUID(),
                blockchainFileId: blockchainFileId,
                url: url,
                proof: null,
                owner_id_fkey: account.data.public_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                submission_status: 'not_submitted',
                txn_hash: receipt.transactionHash    
            })
            .select()
            .single();

        if (insertError) {
            throw new Error(`Error storing file: ${insertError.message}`);
        }

        // Return success response with file details
        return res.status(201).json({
            message: 'File created successfully',
            fileId: blockchainFileId,
            file
        });

    } catch (error) {
        // Log the error for server-side debugging
        console.error('Error creating file:', error);
        
        // Provide more detailed error information when possible
        if (error instanceof Error) {
            return res.status(500).json({ 
                message: 'Error creating file',
                error: error.message 
            });
        }
        
        // Fallback for unknown error types
        return res.status(500).json({ 
            message: 'Unknown error occurred while creating file' 
        });
    }
}
