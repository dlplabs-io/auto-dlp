import { NextApiRequest, NextApiResponse } from 'next';
import { DimoWrapper, DimoError } from '../../../../../lib/dimo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { vehicleId } = req.query;

  if (!vehicleId || typeof vehicleId !== 'string') {
    return res.status(400).json({ error: 'vehicleId is required in the path' });
  }

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
    
    if (error && typeof error === 'object' && 'body' in error && 
        error.body && typeof error.body === 'object' && 
        'status' in error.body && 'message' in error.body) {
      
      const dimoError = error as DimoError;
      return res.status(dimoError.body.status).json({
        error: dimoError.body.message
      });
    }

    return res.status(500).json({
      error: 'Internal server error while checking DIMO permissions'
    });
  }
}
