import { config } from 'dotenv';
config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const ENV = {
  // Contract Addresses
  DATAREGISTRY_CONTRACT_ADDRESS: requireEnv('DATAREGISTRY_CONTRACT_ADDRESS') as `0x${string}`,
  
  // Wallet Configuration
  DLP_OPERATOR_PRIVATE_KEY: requireEnv('DLP_OPERATOR_PRIVATE_KEY') as `0x${string}`,
  PROVER_PRIVATE_KEY: requireEnv('PROVER_PRIVATE_KEY') as `0x${string}`,
  
  // Network Configuration
  RPC_ENDPOINT: requireEnv('RPC_ENDPOINT'),
  BASE_URL: requireEnv('BASE_URL'),
  
  // Gelato Configuration
  GELATO_RELAY_API_KEY: requireEnv('GELATO_RELAY_API_KEY'),
  
  // DLP Configuration
  DLP_ID: parseInt(requireEnv('DLP_ID')),
  
  // Supabase Configuration
  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_ANON_KEY: requireEnv('SUPABASE_ANON_KEY'),
  SUPABASE_ACCESS_TOKEN: requireEnv('SUPABASE_ACCESS_TOKEN'),
  
  // Encryption Configuration
  ENCRYPTION_SEED: requireEnv('ENCRYPTION_SEED'),
} as const;
