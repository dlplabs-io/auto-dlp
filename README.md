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

### API Structure

The API follows RESTful principles with the following structure:

### File Management
- `GET /api/files/{fileId}` - Get details about a specific file
- `POST /api/files/{fileId}/generate` - Generate proof for a specific file
- `POST /api/files/{fileId}/proof` - Update proof data for a specific file
- `POST /api/files/sync` - Synchronize files from blockchain to database

### DIMO Integration
- `GET /api/dimo/vehicles` - List vehicles owned by a wallet address
- `GET /api/dimo/vehicles/{vehicleId}/permissions` - Check vehicle permissions
- `POST /api/dimo/vehicles/{vehicleId}/proof` - Generate proof for a vehicle

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

### File Management API

#### Get File Details
```http
GET /api/files/{fileId}
```

Retrieves details about a specific file by its blockchain file ID.

**Path Parameters**
- `fileId`: Blockchain file ID

**Response**
```json
{
  "id": string,
  "blockchainFileId": number,
  "url": string,
  "ownerAddress": string,
  "ownerPublicId": string,
  "hasCompletedDimo": boolean,
  "createdAt": string
}
```

**Error Responses**
- `404 Not Found`: File not found
- `500 Internal Server Error`: Server error

#### Generate Proof for File
```http
POST /api/files/{fileId}/generate
```

Generates a cryptographic proof for a specific file and stores it in the database.

**Path Parameters**
- `fileId`: Blockchain file ID

**Response**
```json
{
  "fileId": string,
  "success": boolean,
  "error": string (optional)
}
```

**Error Responses**
- `400 Bad Request`: Invalid file ID
- `404 Not Found`: File not found
- `405 Method Not Allowed`: Method other than POST
- `500 Internal Server Error`: Error generating proof

#### Sync Files from Blockchain
```http
POST /api/files/sync
```

Synchronizes files from the blockchain to the local database by processing transactions for specified profiles.

**Request Body**
```json
{
  "profileIds": string[]
}
```

**Response**
```json
{
  "success": boolean,
  "results": [
    {
      "profileId": string,
      "filesProcessed": number,
      "error": string (optional)
    }
  ],
  "totalFilesProcessed": number,
  "failedProfiles": string[]
}
```

This endpoint:
1. Processes each profile in the provided array
2. Polls the profile's relay URL to get transaction status
3. Retrieves transaction receipts and extracts FileAdded events
4. Creates or updates file records in the database

**Error Responses**
- `400 Bad Request`: Missing or invalid profileIds array
- `405 Method Not Allowed`: Method other than POST
- `500 Internal Server Error`: Error during synchronization

## Database Operations

The following endpoints perform database operations:

### Create Operations
- `POST /api/files` - Creates new file entries in the database

### Update Operations
- `POST /api/files/{fileId}/generate` - Updates files with proof data
- `POST /api/files/{fileId}/proof` - Updates proof-related data for a specific file
- `POST /api/files/sync` - Creates or updates file records based on blockchain events

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