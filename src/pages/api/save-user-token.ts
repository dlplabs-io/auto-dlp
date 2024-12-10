import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';

const userTokens: Record<string, { email: string, token: string, createdAt: number }> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { token, email, walletAddress } = req.body;

  if (!token || !email || !walletAddress) {
    return res.status(400).json({ message: 'Token, email, and wallet address are required' });
  }

  try {
    // Decode the JWT
    const decoded = jwt.decode(token, {complete: true});
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid JWT' });
    }

    const payload = decoded.payload as JwtPayload;

    // Encrypt the token
    const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Encryption key not set');
    }
    const encryptedToken = encryptToken(token, encryptionKey);

    // Update the profile entry
    const profile = await prisma.profile.upsert({
      where: { 
        email,
        walletAddress 
      },
      update: {
        updatedAt: new Date()
      },
      create: {
        email,
        walletAddress
      }
    });

    // Create DimoToken associated with the profile
    const dimoToken = await prisma.dimoToken.create({
      data: {
        token: encryptedToken,
        profileId: profile.id,
        expiresAt: new Date(payload.exp! * 1000) // Convert JWT exp to Date
      }
    });

    return res.status(200).json({ 
      message: 'Token saved successfully', 
      profileId: profile.id, // These should be the same
      tokenId: dimoToken.id // These should be the same. 
    });

  } catch (error) {
    console.error('Error saving token:', error);
    return res.status(500).json({ 
      message: 'Error saving token',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Encryption utility functions
function encryptToken(token: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', 
    crypto.scryptSync(key, 'salt', 32), 
    iv
  );
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptToken(encryptedToken: string, key: string): string {
  const [ivHex, encryptedHex] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', 
    crypto.scryptSync(key, 'salt', 32), 
    iv
  );
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function getUserToken(userId: string) {
  return userTokens[userId];
}

export function isTokenValid(userId: string): boolean {
  const userToken = userTokens[userId];
  
  if (!userToken) return false;

  // I think the token is valid for 10 days, but unclear. 
  // TODO: check with Dimo to get our auth token extended for longer periods of time. 
  const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds
  return (Date.now() - userToken.createdAt) < TOKEN_EXPIRY;
}
