import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { prisma } from '@/lib/prisma';
import { DATA_REGISTRY_ABI } from '@/contracts/DataRegistryABI';
import { 
  prepareProofData, 
  signProof, 
  verifyProofSignature 
} from '@/lib/proofGeneration';

// Service endpoint to interact with the data registry. For the initial phase, we can offload this to the user to submit the txn. 
// Service will submit the proof
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Validate request method
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    const { 
        action, 
        data 
    } = req.body;

    const contractAddress = process.env.DATA_REGISTRY_CONTRACT_ADDRESS;
    if (!contractAddress) {
        return res.status(500).json({ message: 'Contract address not configured' });
    }

    const walletPrivateKey = process.env.DATA_REGISTRY_WALLET_PRIVATE_KEY;
    if (!walletPrivateKey) {
        return res.status(500).json({ message: 'Wallet private key not configured' });
    }

    if (!action) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    try {
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

        // Handle different actions
        let result;
        switch (action) {
            case 'addFile':
                // Validate required data for adding a file
                if (!data.url) {
                    return res.status(400).json({ message: 'URL is required to add a file' });
                }
                
                // Add file to the contract
                result = await contract.addFile(data.url);
                
                // Optional, we don't need to do this
                await prisma.file.create({
                    data: {
                        url: data.url,
                        blockchainFileId: result.toString(),
                        ownerAddress: wallet.address,
                        ownerId: data.profileId // Assuming profileId is passed in
                    }
                });

                break;

            case 'addFilePermission': // TODO: This is for data sales? unclear how we'd do this
                if (!data.fileId || !data.account || !data.key) {
                    return res.status(400).json({ message: 'FileId, account, and key are required' });
                }

                result = await contract.addFilePermission(
                    data.fileId, 
                    data.account, 
                    data.key
                );

                // Optional, we don't need to do this
                await prisma.filePermission.create({
                    data: {
                        fileId: data.fileId.toString(),
                        accountAddress: data.account,
                        permissionKey: data.key
                    }
                });

                break;

            case 'addProof': // TODO: MUST be called after adding a file.
                if (!data.fileId || !data.proof) {
                    return res.status(400).json({ message: 'FileId and proof are required' });
                }

                // Verify proof signature before submitting
                if (!verifyProofSignature(data.proof)) {
                    return res.status(400).json({ message: 'Invalid proof signature' });
                }

                result = await contract.addProof(
                    data.fileId, 
                    data.proof
                );

                // Optional, we don't need to do this
                await prisma.fileProof.create({
                    data: {
                        fileId: data.fileId.toString(),
                        proofData: JSON.stringify(data.proof)
                    }
                });

                break;

            default:
                return res.status(400).json({ message: 'Unsupported action' });
        }

        // Return transaction details
        return res.status(200).json({
            message: `${action} successful`,
            result: result ? result.toString() : null
        });

    } catch (error) {
        console.error('Data Registry interaction error:', error);
        
        if (error instanceof Error) {
            return res.status(500).json({ 
                message: `Error performing ${action}`,
                error: error.message 
            });
        }

        return res.status(500).json({ 
            message: 'Unknown error occurred during contract interaction' 
        });
    }
}
