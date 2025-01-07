import { NextApiRequest, NextApiResponse } from 'next';
import { generateProof } from '@/lib/proofGeneration';
import { supabase } from '@/lib/supabase';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { vanaChain } from '@/lib/chains';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileId } = req.query;

  if (!fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'fileId is required in the path' });
  }

  try {
    // Initialize wallet for signing
    if (!process.env.DATA_REGISTRY_WALLET_PRIVATE_KEY) {
      throw new Error('DATA_REGISTRY_WALLET_PRIVATE_KEY not configured');
    }

    const account = privateKeyToAccount(process.env.DATA_REGISTRY_WALLET_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: vanaChain,
      transport: http(process.env.RPC_ENDPOINT)
    });

    // Generate proof
    const proof = await generateProof({
      fileId,
      wallet: {
        address: account.address,
        privateKey: process.env.DATA_REGISTRY_WALLET_PRIVATE_KEY
      },
      includeFile: false
    });

    // Save proof to database
    const { error: updateError } = await supabase
      .from('files')
      .update({ 
        proof: JSON.stringify(proof.signedProof)
      })
      .eq('blockchainFileId', fileId);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      fileId: Number(fileId),
      proof: proof.signedProof,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error generating proof for file:', error);
    
    if (error.message) {
      return res.status(400).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: 'Internal server error while generating proof'
    });
  }
}
