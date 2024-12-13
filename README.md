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
- `DATAREGISTRY_CONTRACT_ADDRESS`: Ethereum contract address for the data registry
- `DATA_REGISTRY_WALLET_PRIVATE_KEY`: Private key for the wallet that will interact with the contract
- `DLP_ID`: Your DLP ID
- `PROVER_URL`: URL for the proof generation service
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

4. Run the development server:
```bash
yarn dev
```

## API Documentation

### Files

#### Create File
```http
POST /api/files
```

Creates a new file entry and adds it to the blockchain.

**Request Body**
```json
{
  "url": "string",
  "ownerAddress": "string"
}
```

**Response**
```json
{
  "message": "File created successfully",
  "fileId": "string",
  "file": {
    "id": "string",
    "blockchainFileId": "string",
    "url": "string",
    "ownerAddress": "string",
    "ownerId": "string | null",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### Get File Details
```http
GET /api/files/{fileId}
```

Retrieves file details including owner information.

**Response**
```json
{
  "id": "string",
  "url": "string",
  "ownerAddress": "string",
  "ownerPublicId": "string | null",
  "hasCompletedDimo": "boolean",
  "createdAt": "string"
}
```

### File Permissions

#### Add File Permission
```http
POST /api/files/{fileId}/permissions
```

Adds a permission for a specific account to access the file.

**Request Body**
```json
{
  "accountAddress": "string",
  "permissionKey": "string"
}
```

**Response**
```json
{
  "message": "Permission added successfully",
  "fileId": "string",
  "accountAddress": "string"
}
```

### File Proofs

#### Generate Proof
```http
POST /api/files/{fileId}/proof
```

Generates and submits a proof for a file to the blockchain.

**Response**
```json
{
  "message": "Proof generated and added successfully",
  "result": "string",
  "proof": {
    // Proof data structure
  }
}
```

#### Debug Proof Generation
```http
GET /api/files/{fileId}/proof/debug
```

Returns debug information about proof generation without submitting to the blockchain.

**Response**
```json
{
  "unsignedProof": {
    // Unsigned proof data
  },
  "signedProof": {
    // Signed proof data
  },
  "debug": {
    "hasEncryptionKey": "boolean",
    "proverAddress": "string",
    "dlpId": "number"
  },
  "file": {
    "id": "string",
    "url": "string",
    "ownerAddress": "string"
  }
}
```

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