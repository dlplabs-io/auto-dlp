import { NextApiRequest, NextApiResponse } from 'next';
import { DimoWrapper, DimoError } from '../../../lib/dimo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress, vehicleId } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: 'walletAddress is required as a query parameter' });
  }

  if (!vehicleId) {
    return res.status(400).json({ error: 'vehicleTokenId is required as a query parameter' });
  }

  const vehicleTokenId = Number(vehicleId);
  if (vehicleTokenId <= 0) {
    return res.status(400).json({ error: 'vehicleTokenId must be a positive number' })
  }

  try {
    console.log("Checking DIMO permissions for wallet:", walletAddress, "vehicle:", vehicleTokenId);
    const dimoClient = DimoWrapper.getInstance();
    const permissions = await dimoClient.checkPermissions(walletAddress, vehicleTokenId);
    
    console.debug("permissionsResponse", permissions);
    
    return res.status(200).json({
      ...permissions,
      walletAddress,
      vehicleTokenId
    });

  } catch (error: DimoError | any) {
    console.error('Error checking DIMO permissions:', error);
    
    // Check if error is of type DimoError
    if (error && typeof error === 'object' && 'body' in error && 
        error.body && typeof error.body === 'object' && 
        'status' in error.body && 'message' in error.body) {
      
      const dimoError = error as DimoError;

      return res.status(dimoError.body.status).json({
        error: 'Failed to check permissions',
        details: dimoError.body.message,
        walletAddress,
        vehicleTokenId
      });
    }
    
    // Default error response for non-DimoError cases
    return res.status(500).json({
      error: 'Failed to check permissions',
      details: error instanceof Error ? error.message : 'Unknown error',
      walletAddress,
      vehicleTokenId
    });
  }
}
