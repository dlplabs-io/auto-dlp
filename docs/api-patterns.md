# API Call Patterns

## Fetching File IDs and Generating Proofs

Synchronize files from the blockchain and generate proofs for them.

### 1. Sync Files from Blockchain

First, synchronize files from the accounts table to the files table:

```http
POST /api/files/sync
```

**Request Body:**
```json
{
  "accountIds": ["account-public-id-1", "account-public-id-2"]
}
```

**What this does:**
- Fetches transaction data from each account's `dataregistry_url`
  - Uses the public id from the accounts table to fetch the dataregistry URL
- Polls the Gelato relay service to check transaction status
- Extracts `FileAdded` events from successful transactions
- Creates or updates file records in the database
- Returns information about processed files

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "accountId": "account-public-id-1",
      "filesProcessed": 3
    },
    {
      "accountId": "account-public-id-2",
      "filesProcessed": 2
    }
  ],
  "totalFilesProcessed": 5,
  "failedAccounts": []
}
```

### 2. List Files (Optional)

If you want to verify which files were synced:

```http
GET /api/files
```

This lists all files in the database, which you can use to confirm the sync was successful.

### 3. Generate Proofs for Each File

For each file ID retrieved from Step 1:

```http
POST /api/files/{fileId}/generate
```

**What this does:**
- Fetches the file record from the database using the blockchain file ID
- Generates a proof using the prover's private key
- Formats the proof for blockchain submission
- Updates the file record with both formatted and verbose proof data
- Updates the file status to `proof_generated`

**Response:**
```json
{
  "fileId": "123",
  "success": true
}
```

### 4. Submit Proofs to Blockchain

After generating proofs, submit them to the blockchain:

```http
POST /api/files/{fileId}/submit
```

**What this does:**
- Checks if the file already has a proof transaction on chain
- If not, submits the proof to the blockchain using the Gelato relay service
- Updates the file record with the relay task URL
- Updates the file status to `pending`
- Returns immediately without waiting for the transaction to complete

**Response (Successful Submission):**
```json
{
  "message": "Proof submission initiated",
  "fileId": "123",
  "taskId": "0x...",
  "relayUrl": "https://relay.gelato.digital/tasks/status/0x..."
}
```

**Response (Already Submitted):**
```json
{
  "message": "Proof already submitted to blockchain",
  "fileId": "123",
  "transactionHash": "0x..."
}
```

### 5. Check Proof Submission Status

To check the status of a proof submission:

```http
GET /api/files/{fileId}/update-status
```

**What this does:**
- Checks the current status of a proof submission with the Gelato relay service
- Updates the database record if the proof has been successfully submitted
- Updates the file status to `confirmed` or `failed` based on the result
- Returns the current status of the submission

**Response (Confirmed):**
```json
{
  "fileId": "123",
  "status": "confirmed",
  "transactionHash": "0x...",
  "isOnchain": true,
  "message": "Proof confirmed on blockchain",
  "taskId": "0x..."
}
```

**Response (Pending):**
```json
{
  "fileId": "123",
  "status": "pending",
  "isOnchain": false,
  "message": "Proof submission is still pending",
  "taskId": "0x..."
}
```

**Response (Failed):**
```json
{
  "fileId": "123",
  "status": "failed",
  "isOnchain": false,
  "message": "Proof submission failed with status: ExecReverted",
  "taskId": "0x..."
}
```

### 6. Fetch Proof Data

To retrieve the verbose proof data for a file:

```http
GET /api/files/{fileId}/proof
```

**What this does:**
- Fetches the verbose proof data from the database for the specified file
- Returns the complete proof data as JSON

**Response (Success):**
```json
{
  "signature": "0x...",
  "signed_fields": {
    "proof": {
      "created_at": "2025-03-14T00:36:47-04:00",
      "score": 95,
      "attributes": ["high_quality", "premium"]
    }
  }
}
```

**Response (Not Found):**
```json
{
  "error": "Proof not found for this file"
}
```

### 7. Verify Proof Generation (Optional)

To verify a proof was generated correctly:

```http
GET /api/files/{fileId}
```

This returns the file details including proof information if available.

## Alternative Debug Flow

If you're testing or debugging, you can use:

```http
GET /api/files/{fileId}/proof/debug
```

This generates a proof without storing it in the database, which is useful for testing.

## Complete Flow Example

Here's a complete example flow with curl commands:

```bash
# Step 1: Sync files from blockchain
curl -X POST http://localhost:3000/api/files/sync \
  -H "Content-Type: application/json" \
  -d '{"accountIds": ["account-123"]}'

# Step 2: Generate proofs for each file
# (Assuming fileId 456 was returned from the sync)
curl -X POST http://localhost:3000/api/files/456/generate

# Step 3: Submit proof to blockchain
curl -X POST http://localhost:3000/api/files/456/submit

# Step 4: Check submission status
curl -X GET http://localhost:3000/api/files/456/update-status

# Step 5: Retrieve the proof data
curl -X GET http://localhost:3000/api/files/456/proof
```

## Best Practices

1. **Rate Limiting**: When processing large numbers of files, implement rate limiting
2. **Batch Processing**: Process files in batches to avoid timeouts
3. **Error Handling**: Implement retry logic for failed proof generations
4. **Monitoring**: Track the number of files synced and proofs generated
5. **Webhook Integration**: Set up webhooks to notify your system when proofs are successfully submitted to the blockchain

## Background Worker Flow

The application uses a series of background workers (cron jobs) to automate the entire process of syncing accounts, generating proofs, submitting them to the blockchain, and updating their statuses.

### Cron Job Schedule

The following cron jobs are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-accounts",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/generate-proofs",
      "schedule": "*/10 * * * *"
    },
    {
      "path": "/api/cron/submit-proofs",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/update-proof-statuses",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Background Worker Process Flow

1. **Sync Accounts** (`/api/cron/sync-accounts`)
   - Runs every 15 minutes
   - Identifies accounts with `file_sync_status: 'not_synced'` and `dataregistry_url` not null
   - Calls the `/api/files/sync` endpoint for each account
   - Updates account `file_sync_status` to `synced` or `failed`

2. **Generate Proofs** (`/api/cron/generate-proofs`)
   - Runs every 10 minutes
   - Identifies files with `status: 'new'` (no proof generated)
   - Calls the `/api/files/{fileId}/generate` endpoint for each file
   - Updates file status to `proof_generated` or `failed`

3. **Submit Proofs** (`/api/cron/submit-proofs`)
   - Runs every 5 minutes
   - Identifies files with `status: 'proof_generated'`
   - Calls the `/api/files/{fileId}/submit` endpoint for each file
   - Updates file status to `pending`

4. **Update Proof Statuses** (`/api/cron/update-proof-statuses`)
   - Runs every 5 minutes
   - Identifies files with `status: 'pending'`
   - Calls the `/api/files/{fileId}/update-status` endpoint for each file
   - Updates file status to `confirmed` or `failed` based on blockchain status

### File Status Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │     │             │
│  not_synced ├────►│     new     ├────►│proof_generated────►│   pending   ├────►│  confirmed  │
│             │     │             │     │             │     │             │     │             │
└─────────────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └─────────────┘
                           │                   │                   │
                           │                   │                   │
                           ▼                   ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                    │             │     │             │     │             │
                    │   failed    │     │   failed    │     │   failed    │
                    │             │     │             │     │             │
                    └─────────────┘     └─────────────┘     └─────────────┘
```

### Background Worker Process Diagram

```
┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│                │    │                │    │                │    │                │
│  sync-accounts ├───►│ generate-proofs├───►│  submit-proofs ├───►│update-statuses │
│  (15 min cron) │    │  (10 min cron) │    │  (5 min cron)  │    │  (5 min cron)  │
│                │    │                │    │                │    │                │
└───────┬────────┘    └───────┬────────┘    └───────┬────────┘    └───────┬────────┘
        │                     │                     │                     │
        ▼                     ▼                     ▼                     ▼
┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│                │    │                │    │                │    │                │
│   /api/files/  │    │  /api/files/   │    │  /api/files/   │    │  /api/files/   │
│      sync      │    │{fileId}/generate│    │ {fileId}/submit │    │{fileId}/update-│
│                │    │                │    │                │    │     status     │
└────────────────┘    └────────────────┘    └────────────────┘    └────────────────┘
```

## DIMO Integration Workflow

If working with DIMO vehicles:

1. Get vehicles for a wallet:
   ```http
   GET /api/dimo/vehicles?walletAddress={walletAddress}
   ```

2. Check permissions for a specific vehicle:
   ```http
   GET /api/dimo/vehicles/{vehicleId}/permissions
   ```

3. Generate proofs for vehicle data (if applicable)
