import { NextApiRequest, NextApiResponse } from 'next';
import { DimoWrapper, DimoError } from '../../../../../lib/dimo';

/**
 * Checks permissions for a specific DIMO vehicle  
 * Does not update any DB records
 * 
 * This endpoint:
 * 1. Takes a vehicle ID as a path parameter
 * 2. Connects to the DIMO API to check permissions for the specified vehicle
 * 3. Returns the permission status along with the vehicle ID
 * 
 * Path Parameters:
 * - vehicleId: DIMO vehicle token ID (required)
 * 
 * @param req - NextJS API request with vehicleId as path parameter
 * @param res - NextJS API response
 * @returns JSON response with permission data or appropriate error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract vehicleId from the path parameter
  const { vehicleId } = req.query;

  // Validate the vehicleId parameter exists and is a string
  if (!vehicleId || typeof vehicleId !== 'string') {
    return res.status(400).json({ error: 'vehicleId is required in the path' });
  }

  // Convert vehicleId to a number and validate it's positive
  const vehicleTokenId = Number(vehicleId);
  if (vehicleTokenId <= 0) {
    return res.status(400).json({ error: 'vehicleId must be a positive number' });
  }

  try {
    console.log("Checking DIMO permissions for vehicle:", vehicleTokenId);
    const dimoClient = DimoWrapper.getInstance();
    
    const response = await dimoClient.checkPermissions(vehicleTokenId);

    return res.status(200).json({
      ...response,
      vehicleId: vehicleTokenId,
    });

  } catch (error: DimoError | any) {
    console.error('Error checking DIMO permissions:', error);
    
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
      error: 'Internal server error while checking DIMO permissions'
    });
  }
}
