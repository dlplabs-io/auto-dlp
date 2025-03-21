import { NextApiRequest, NextApiResponse } from 'next';
import { FILES_TABLE, GetSupabaseClient } from '@/lib/supabase';
import { generateProof, getAttributesFromScore } from '@/lib/proofGeneration';
import { ENV } from '@/config/env';
import { Database } from '@/types/supabase';
import { FormattedProof } from '@/types';

/**
 * Generates a proof for a specific file and stores it in the database
 * 
 * This endpoint:
 * 1. Fetches the file record from the files table using the blockchain file ID
 * 2. Generates a proof using the prover's private key
 * 3. Formats the proof for blockchain submission
 * 4. Updates the file record with both formatted and verbose proof data
 * 
 * @param req - NextJS API request containing fileId as a path parameter
 * @param res - NextJS API response
 * @returns JSON response with success status or appropriate error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract fileId from the path parameter
  const { fileId } = req.query;

  // Validate the fileId parameter
  if (!fileId || Array.isArray(fileId)) {
    return res.status(400).json({ error: 'Valid fileId is required' });
  }

  const supabase = GetSupabaseClient();

  try {
    // Get the file from the database
    const { data: file, error: fileError } = await supabase
      .from(FILES_TABLE)
      .select('*')
      .eq('blockchainFileId', fileId)
      .single();

    // Handle file not found error
    if (fileError || !file) {
      return res.status(404).json({ 
        error: 'File not found',
        message: fileError?.message || 'File with the specified ID does not exist'
      });
    }

    // Generate cryptographic proof using the prover's private key
    const proofResult = await generateProof({
      fileId: file.blockchainFileId.toString(),
      privateKey: ENV.PROVER_PRIVATE_KEY
    });

    // Check for errors during the proof generation process
    if (!proofResult.fileData.isValid) {
      return res.status(400).json({
        error: 'Invalid file data',
        message: 'File data is not valid (check logs)'
      });
    }

    // Format the proof for blockchain submission with specific fields
    const formattedProof: FormattedProof = {
      fileId: Number(file.blockchainFileId),
      signature: proofResult.signedProof.signature,
      data: {
        score: proofResult.signedProof.signed_fields.proof.score,
        dlpId: proofResult.signedProof.signed_fields.proof.dlp_id,
        metadata: JSON.stringify({
          timestamp: proofResult.signedProof.signed_fields.proof.created_at,
          attributes: getAttributesFromScore(proofResult.signedProof.signed_fields.proof.score)
        }),
        proofUrl: `${ENV.APP_URL}/api/files/${fileId}/proof`,
        instruction: '' // keep this empty until we have instructions
      }
    };

    // Update the file record with both proofs (formatted and verbose)
    const { error: updateError } = await supabase
      .from(FILES_TABLE)
      .update({
        proof: JSON.parse(JSON.stringify({ proof: formattedProof })),
        verbose_proof: JSON.parse(JSON.stringify(proofResult.signedProof)), 
        status : 'proof_generated' as Database['public']['Enums']['file_status'],
        proof_txn: null // Will be set when proof is submitted to blockchain
      })
      .eq('id', file.id);

    // Handle database update error
    if (updateError) {
      throw new Error(`Error updating file: ${updateError.message}`);
    }

    // Return success response
    return res.status(200).json({
      fileId: file.id,
      success: true
    });

  } catch (error: any) {
    // Log and return error response
    console.error('Error generating proof:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
