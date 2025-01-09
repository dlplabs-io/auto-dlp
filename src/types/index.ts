export interface ProofData {
  score: number;
  dlpId: number;
  metadata: string;
  proofUrl: string;
  instruction: string;
}

export interface FormattedProof {
  fileId: number;
  signature: string;
  data: ProofData;
}

export interface FileEvent {
  fileId: string;
  ownerAddress: string;
  url: string;
  transactionHash: string;
  blockNumber: number;
  profileId: string;
  createdAt: string;
}

export interface OnChainFile {
  url: string;
  owner: string;
  onBlock: bigint;
  fileId: bigint;
}

export interface FileData {
  blockchainFileId: number;
  url: string;
  ownerAddress: string;
  onChainFile?: OnChainFile;
  fileBuffer?: Buffer;
}

export interface FileDataWithScore extends FileData {
  score: number;
  message: string;
  isValid: boolean;
}

export interface ProofDetails {
  image_url: string;
  created_at: number;
  duration: number;
  dlp_id: number;
  valid: boolean;
  score: number;
  authenticity: number;
  ownership: number;
  quality: number;
  uniqueness: number;
  attributes: Record<string, any>;
  metadata: {
    dlp_id: number;
  };
}

export interface SignedProof {
  signed_fields: {
    subject: {
      file_id: number;
      url: string;
      owner_address: string;
      decrypted_file_checksum: string;
      encrypted_file_checksum: string;
      encryption_seed: string;
    };
    prover: {
      type: string;
      address: string;
      url: string;
    };
    proof: ProofDetails;
  };
  signature: string;
}

export interface GenerateProofResult {
  fileData: FileDataWithScore;
  unsignedProof: SignedProof;
  signedProof: SignedProof;
  debug: {
    hasEncryptionKey: boolean;
    proverAddress: string;
    dlpId: number;
  };
}

export interface GenerateProofOptions {
  fileId: string;
  privateKey: string;
}

export type FileResponse = {
id: bigint;
ownerAddress: string;
url: string;
addedAtBlock: bigint;
}
