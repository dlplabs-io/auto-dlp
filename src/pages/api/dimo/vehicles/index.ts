import { NextApiRequest, NextApiResponse } from 'next';
import { DimoWrapper, DimoError } from '../../../../lib/dimo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress, fields } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: 'walletAddress is required as a query parameter' });
  }

  try {
    console.log("Getting DIMO vehicles for wallet address:", walletAddress);
    const dimoClient = DimoWrapper.getInstance();
    const response = await dimoClient.getVehicles(walletAddress);
    
    // Parse fields parameter to determine what data to return
    const requestedFields = typeof fields === 'string' ? fields.split(',') : [];
    
    if (requestedFields.length > 0) {
      const result: any = { walletAddress };
      
      // Add requested fields to response
      if (requestedFields.includes('count') || requestedFields.includes('hasVehicles')) {
        result.vehicleCount = response.vehicles.length;
        result.hasVehicles = response.vehicles.length > 0;
      }
      
      if (requestedFields.includes('tokenIds')) {
        result.vehicleIds = response.vehicles.map((vehicle) => vehicle.tokenId);
      }
      
      return res.status(200).json(result);
    }

    // If no fields specified, return full vehicle data
    return res.status(200).json({
      vehicles: response.vehicles,
      count: response.vehicles.length,
      walletAddress
    });

  } catch (error: DimoError | any) {
    console.error('Error getting DIMO vehicles:', error);
    
    if (error && typeof error === 'object' && 'body' in error && 
        error.body && typeof error.body === 'object' && 
        'status' in error.body && 'message' in error.body) {
      
      const dimoError = error as DimoError;
      return res.status(dimoError.body.status).json({
        error: dimoError.body.message
      });
    }

    return res.status(500).json({
      error: 'Internal server error while fetching DIMO vehicles'
    });
  }
}
