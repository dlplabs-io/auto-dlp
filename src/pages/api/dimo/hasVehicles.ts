import { NextApiRequest, NextApiResponse } from 'next';
import { DimoWrapper, DimoError } from '../../../lib/dimo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: 'walletAddress is required as a query parameter' });
  }

  try {
    console.log("Getting DIMO vehicles for wallet address:", walletAddress);
    const dimoClient = DimoWrapper.getInstance();
    const response = await dimoClient.getVehicles(walletAddress);
        
    // Return true if the user has at least one vehicle
    return res.status(200).json({
      hasVehicles: response.vehicles.length > 0,
      vehicleCount: response.vehicles.length,
      walletAddress
    });

  } catch (error: DimoError | any) {
    console.error('Error checking DIMO vehicles:', error);
    
    // Check if error is of type DimoError
    if (error && typeof error === 'object' && 'body' in error && 
        error.body && typeof error.body === 'object' && 
        'status' in error.body && 'message' in error.body) {
      
      const dimoError = error as DimoError;

      return res.status(dimoError.body.status).json({
        error: 'Failed to check vehicle status',
        details: dimoError.body.message,
        walletAddress
      });
    }
    
    // Default error response for non-DimoError cases
    return res.status(500).json({
      error: 'Failed to check vehicle status',
      details: error instanceof Error ? error.message : 'Unknown error',
      walletAddress
    });
  }
}
