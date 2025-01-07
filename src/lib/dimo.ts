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
    owner: string;
    tokenId: number;
    manufacturer: {
        name: string;
    };
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
    owner: string;
    tokenId: number
    manufacturer: string
}

export type GetVehiclesResponse = {
    vehicles: GetVehiclesDeviceResponse[]
}

export type PermissionResponse = {
    hasAccess: boolean,
    details?: string
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

  private async getDeveloperToken(): Promise<any> {
    // Check if we have a cached token that's still valid (with 5 min buffer)
    if (this.developerJwt && this.developerJwt.expiry > Date.now() + 300000) {
      return this.developerJwt.token;
    }

    const jwt = await this.dimo.auth.getToken({
      client_id: process.env.DIMO_CLIENT_ID!,
      domain: process.env.DIMO_DOMAIN!,
      private_key: process.env.DIMO_API_KEY!,
    });

    // console.debug(jwt);

    // Cache the token with expiry (1 hour from now)
    this.developerJwt = {
      token: jwt,
      expiry: Date.now() + 3600000 // 1 hour
    };

    return jwt;
  }

  public async getVehicles(walletAddress: string): Promise<GetVehiclesResponse> {
      const queryString = `query {
                vehicles(first:50, filterBy: {owner: "${walletAddress}"}) {
                    nodes {
                        owner,
                        tokenId,
                        manufacturer {
                            name
                        }
                    }
                }
            }`;
      
      const response = await this.dimo.identity.query({
        query: queryString
      }) as unknown as VehicleGraphQLResponse;
      
      console.debug("vehicleResponse", response.data.vehicles.nodes);

      const vehicles = response.data.vehicles.nodes
        .filter((vehicle: SingleVehicleGraphQLResponse) => vehicle.tokenId !== 0)
        .map((vehicle: SingleVehicleGraphQLResponse): GetVehiclesDeviceResponse =>  { 
        return {
            owner: vehicle.owner,
            tokenId: vehicle.tokenId, 
            manufacturer: vehicle.manufacturer.name
        }
      });


    return {vehicles};
  }

  public async checkPermissions(vehicleTokenId: number): Promise<PermissionResponse> {
    const token = await this.getDeveloperToken();
    
    console.log("Checking DIMO permissions for vehicle:", vehicleTokenId);
    try {
        // Exchange developer token for vehicle token
        const vehicleJwt = await this.dimo.tokenexchange.exchange({
            ...token,
            privileges: [1],
            tokenId: vehicleTokenId
        });

        //if you can successfuly exchange the developer token for the vehicle token, you have access
        return {
            hasAccess: true
        }
          
    } catch(error) { 
        console.error('Error exchanging developer token for vehicle token:', error);
        return { hasAccess: false, details: (error as DimoError).body.message };
    }
  }
}