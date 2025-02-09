import * as fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();

import { FormattedProof, ProofData } from '@/types';
import { getAttributesFromScore } from '@/lib/proofGeneration';

interface VerboseProof {
  fileId: string;
  proof: {
    signature: string;
    signed_fields: {
      proof: {
        score: number;
        dlp_id: number;
        created_at: number;
      }
    }
  }
}

async function main() {
  try {
    // Read the proofs JSON file
    const fileContent = await fs.readFile('out/proofs.json', 'utf-8');
    const fileProof: VerboseProof[] = JSON.parse(fileContent);

    console.log(`Found ${fileProof.length} proofs to format`);

    // Format proofs
    const formattedProofs = fileProof.map((fileProof): FormattedProof => ({
      fileId: Number(fileProof.fileId),
      signature: fileProof.proof.signature,
      data: {
        score: fileProof.proof.signed_fields.proof.score,
        dlpId: Number(fileProof.proof.signed_fields.proof.dlp_id),
        metadata: JSON.stringify({
          timestamp: fileProof.proof.signed_fields.proof.created_at,
          attributes: getAttributesFromScore(fileProof.proof.signed_fields.proof.score)
        }),
        proofUrl: process.env.BASE_URL || '',
        instruction: process.env.BASE_URL || ''
      }
    }));

    // Save formatted proofs
    const json = JSON.stringify(formattedProofs, null, 2);
    await fs.writeFile('out/formattedProofs.json', json);

    console.log(`Successfully formatted ${formattedProofs.length} proofs`);
    console.log('Saved to out/formattedProofs.json');

  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main();
