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
- `DATA_REGISTRY_WALLET_PRIVATE_KEY`: Private key for the wallet that will interact with the contract
- `DLP_ID`: Your DLP ID
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase service role key

4. Run the development server:
```bash
yarn dev
```

## API Documentation

### DIMO Vehicle Integration

#### Check Vehicle Ownership
```http
GET /api/dimo/hasVehicles?walletAddress={walletAddress}
```

Checks if a wallet address owns any DIMO vehicles.

**Query Parameters**
- `walletAddress`: Ethereum address to check for vehicle ownership

**Response**
```json
{
  "hasVehicles": boolean,
  "vehicleCount": number,
  "vehicleIds": number[],
  "walletAddress": string
}
```

#### Check Vehicle Permissions
```http
GET /api/dimo/checkPermissions?walletAddress={walletAddress}&vehicleId={vehicleId}
```

Checks if a wallet address has permission to access a specific vehicle.

**Query Parameters**
- `walletAddress`: Ethereum address to check permissions for
- `vehicleId`: DIMO vehicle token ID

**Response**
```json
{
  "hasAccess": boolean,
  "details": string (optional),
  "walletAddress": string,
  "vehicleTokenId": number
}
```

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