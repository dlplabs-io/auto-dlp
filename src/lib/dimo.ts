import { DIMO } from '@dimo-network/data-sdk/dist/dimo';

///////////// TYPES ////////////////
export type DimoError = {
  body: {
    status: number;
    message: string;
  };
}

type DeviceTypeGraphQLResponse = {
    address: string;
    tokenId: number
}

type SingleVehicleGraphQLResponse = {
    aftermarketDevice: DeviceTypeGraphQLResponse;
    syntheticDevice: DeviceTypeGraphQLResponse,
    definition: { 
        make: string;
        model: string;
        year: number
    }
}
type VehicleGraphQLResponse = {
  data: {
    vehicles: {
      nodes: SingleVehicleGraphQLResponse[];
    }
  }
}

type DimoJwt = {
    headers: {
        Authorization: string
    }
}

// Exported types
export type GetVehiclesDeviceResponse = {
    make: string;
    model: string;
    year: number
    tokenId: number
    address: string
}

export type GetVehiclesResponse = {
    vehicles: GetVehiclesDeviceResponse[]
}

export type PermissionResponse = {
    hasAccess: boolean
}

export const dimo = new DIMO("Production");

export class DimoWrapper {
  private dimo: DIMO;
  private developerJwt: { token: DimoJwt; expiry: number } | null = null;
  private static instance: DimoWrapper | null = null;

  private constructor() {
    this.dimo = new DIMO("Production");
  }

  public static getInstance(): DimoWrapper {
    if (!DimoWrapper.instance) {
      DimoWrapper.instance = new DimoWrapper();
    }
    return DimoWrapper.instance;
  }

  private async getDeveloperToken(): Promise<DimoJwt> {
    // Check if we have a cached token that's still valid (with 5 min buffer)
    if (this.developerJwt && this.developerJwt.expiry > Date.now() + 300000) {
      return this.developerJwt.token;
    }

    const jwt = await this.dimo.auth.getToken({
      client_id: process.env.DIMO_CLIENT_ID!,
      domain: process.env.DIMO_DOMAIN!,
      private_key: process.env.DIMO_API_KEY!,
    });

    // Cache the token with expiry (1 hour from now)
    this.developerJwt = {
      token: jwt,
      expiry: Date.now() + 3600000 // 1 hour
    };

    return jwt;
  }

  public async getVehicles(walletAddress: string): Promise<GetVehiclesResponse> {
    const response = await this.dimo.identity.listVehicleDefinitionsPerAddress({
        address: walletAddress,
        limit: 10
      });
      console.debug("vehicleResponse", response.data.vehicles.nodes);

      const vehicles = response.data.vehicles.nodes
        .filter((vehicle: SingleVehicleGraphQLResponse) => vehicle.aftermarketDevice || vehicle.syntheticDevice)
        .map((vehicle: SingleVehicleGraphQLResponse): GetVehiclesDeviceResponse =>  {
        let returnObj: GetVehiclesDeviceResponse = {
            make: vehicle.definition.make,
            model: vehicle.definition.model,
            year: vehicle.definition.year,
            tokenId: 0, // initialize
            address: "" // initialize
        }

        if (vehicle.aftermarketDevice) {
            returnObj.tokenId = vehicle.aftermarketDevice.tokenId;
            returnObj.address = vehicle.aftermarketDevice.address;
        } else if (vehicle.syntheticDevice) {
            returnObj.tokenId = vehicle.syntheticDevice.tokenId;
            returnObj.address = vehicle.syntheticDevice.address;
        }

        return returnObj
      });


    return {vehicles};
  }

  public async checkPermissions(walletAddress: string, vehicleTokenId: number): Promise<PermissionResponse> {
    const token = await this.getDeveloperToken();
    
    try {
        // Exchange developer token for vehicle token
        const vehicleJwt = await this.dimo.tokenexchange.exchange({
            ...token,
            privileges: [1,2,3,4,5,6],
            tokenId: vehicleTokenId
        });

        //if you can successfuly exchange the developer token for the vehicle token, you have access
        return {
            hasAccess: true
        }
          
    } catch(error) { 
        console.error('Error exchanging developer token for vehicle token:', error);
        return { hasAccess: false }
    }
  }
}