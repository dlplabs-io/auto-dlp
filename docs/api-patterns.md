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

**Response:**
```json
{
  "fileId": "123",
  "success": true
}
```

### 4. Verify Proof Generation (Optional)

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

# Step 3: Verify proof was generated
curl http://localhost:3000/api/files/456
```

## Automation Considerations

For production environments, consider:

1. **Scheduled Syncing**: Set up a cron job or scheduled task to periodically call the sync endpoint
2. **Batch Processing**: Process files in batches to avoid overwhelming the system
3. **Error Handling**: Implement retry logic for failed proof generations
4. **Monitoring**: Track the number of files synced and proofs generated

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
