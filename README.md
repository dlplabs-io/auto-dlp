# Vehicle DLP

A decentralized file management system with proof generation capabilities.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
yarn install
```

3. Copy `.env.example` to `.env` and fill in the required values:
```bash
cp .env.example .env
```

Required environment variables:
- `DIMO_DOMAIN`: Your DIMO application domain
- `DIMO_CLIENT_ID`: Your DIMO client ID
- `DIMO_API_KEY`: Your DIMO API key
- `DATAREGISTRY_CONTRACT_ADDRESS`: Ethereum contract address for the data registry
- `DLP_OPERATOR_PRIVATE_KEY`: Private key for the wallet that will interact with the contract
- `DLP_ID`: Your DLP ID
- `PROVER_PRIVATE_KEY`: Private key for the wallet that will sign the proof
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase service role key

4. Run the development server:
```bash
yarn dev
```

## API Documentation

### DIMO Vehicle Integration

#### List Vehicles
```http
GET /api/dimo/vehicles?walletAddress={walletAddress}
```

Lists all DIMO vehicles owned by a wallet address.

**Query Parameters**
- `walletAddress`: Ethereum address to check for vehicle ownership -- This is the wallet address that is registered with DIMO (might be different from the wallet address that is logged in)
- `fields` (optional): Comma-separated list of fields to include in response (e.g., `count,hasVehicles,tokenIds`)

**Response**
```json
// Default response (no fields specified)
{
  "vehicles": [
    {
      "owner": string,
      "tokenId": number,
      "manufacturer": string
    }
  ],
  "count": number,
  "walletAddress": string
}

// With fields=count,hasVehicles
{
  "vehicleCount": number,
  "hasVehicles": boolean,
  "walletAddress": string
}
```

#### Check Vehicle Permissions
```http
GET /api/dimo/vehicles/{vehicleId}/permissions
```

Checks if the vehicle token can be accessed.

**Path Parameters**
- `vehicleId`: DIMO vehicle token ID

**Response**
```json
{
  "hasAccess": boolean,
  "details": string (optional),
  "vehicleId": number
}
```

#### Generate Vehicle Proof
```http
POST /api/dimo/vehicles/{vehicleId}/proof
```

Generates a cryptographic proof for a specific vehicle. Requires permission to access the vehicle.

**Path Parameters**
- `vehicleId`: DIMO vehicle token ID

**Response**
```json
{
  "vehicleId": number,
  "proof": {
    "signed_fields": {
      "subject": {
        "file_id": number,
        "url": string,
        "owner_address": string,
        "decrypted_file_checksum": string,
        "encrypted_file_checksum": string,
        "encryption_seed": string
      },
      "prover": {
        "type": string,
        "address": string,
        "url": string
      },
      "proof": {
        "created_at": number,
        "duration": number,
        "dlp_id": number,
        "valid": boolean,
        "score": number,
        // ... other proof details
      }
    },
    "signature": string
  },
  "proverAddress": string,
  "timestamp": string
}
```

**Error Responses**
- `403 Forbidden`: No permission to access the vehicle
- `400 Bad Request`: Invalid vehicle ID
- `500 Internal Server Error`: Error generating proof

### File Management (Work in Progress)

The following endpoints are currently under development and not fully functional:

#### Create File
```http
POST /api/files
```

#### Get File Permissions
```http
GET /api/files/{fileId}/permissions
```

#### Add File Permission
```http
POST /api/files/{fileId}/permissions
```

**Note**: File management endpoints are currently being developed and may not work as expected. Please refer to the DIMO vehicle integration endpoints for stable functionality.

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "message": "Error description",
  "error": "Detailed error message (if available)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Resource created
- `400`: Bad request (missing or invalid parameters)
- `404`: Resource not found
- `405`: Method not allowed
- `500`: Internal server error

## Development

### Database Types

To update the Supabase database types:

```bash
yarn types:supabase
```

This will generate TypeScript types based on your Supabase schema in `src/types/supabase.ts`.

## License

[Add your license information here]