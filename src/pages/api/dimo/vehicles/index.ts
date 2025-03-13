import { NextApiRequest, NextApiResponse } from 'next';
import { DimoWrapper, DimoError } from '../../../../lib/dimo';

/**
 * Retrieves DIMO vehicles owned by a specific wallet address (no db updates)
 * 
 * This endpoint:
 * 1. Takes a wallet address as a query parameter (shouuld be dimo wallet)
 * 2. Connects to the DIMO API to fetch vehicles associated with the wallet
 * 3. Optionally filters the response based on requested fields
 * 
 * Query Parameters:
 * - walletAddress: Ethereum address of the wallet owner (required)
 * - fields: Comma-separated list of fields to include in the response (optional)
 *   Available fields: count, hasVehicles, tokenIds
 * 
 * @param req - NextJS API request with query parameters
 * @param res - NextJS API response
 * @returns JSON response with vehicle data or appropriate error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract query parameters
  const { walletAddress, fields } = req.query;

  // Validate the walletAddress parameter
  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: 'walletAddress is required as a query parameter' });
  }

  try {
    console.log("Getting DIMO vehicles for wallet address:", walletAddress);
    
    const dimoClient = DimoWrapper.getInstance();    
    const response = await dimoClient.getVehicles(walletAddress);
    
    // Parse fields parameter to determine what data to return
    const requestedFields = typeof fields === 'string' ? fields.split(',') : [];
    
    // If specific fields were requested, filter the response accordingly
    if (requestedFields.length > 0) {
      const result: any = { walletAddress };
      
      // Add vehicle count and existence flag if requested
      if (requestedFields.includes('count') || requestedFields.includes('hasVehicles')) {
        result.vehicleCount = response.vehicles.length;
        result.hasVehicles = response.vehicles.length > 0;
      }
      
      // Add vehicle token IDs if requested
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
    // Log the error for server-side debugging
    console.error('Error getting DIMO vehicles:', error);
    
    // Handle DIMO-specific errors with appropriate status codes
    if (error && typeof error === 'object' && 'body' in error && 
        error.body && typeof error.body === 'object' && 
        'status' in error.body && 'message' in error.body) {
      
      const dimoError = error as DimoError;
      return res.status(dimoError.body.status).json({
        error: dimoError.body.message
      });
    }

    // Fallback for general errors
    return res.status(500).json({
      error: 'Internal server error while fetching DIMO vehicles'
    });
  }
}
