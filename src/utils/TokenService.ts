import crypto from 'crypto';

/**
 * Service for generating and validating secure tokens for file access
 * Implements expiring tokens for secure download access
 */

export interface TokenPayload {
  attachmentId: string;
  reportId: string;
  expiresAt: number; // Unix timestamp
}

export class TokenService {
  private secretKey: string;
  private defaultExpirationMinutes: number;

  constructor(secretKey?: string, defaultExpirationMinutes: number = 60) {
    // Use environment variable or generate a default (in production, always use env var)
    this.secretKey = secretKey || process.env.TOKEN_SECRET || 'default-secret-key-change-in-production';
    this.defaultExpirationMinutes = defaultExpirationMinutes;
  }

  /**
   * Generate a signed token for file access
   * @param attachmentId The attachment ID
   * @param reportId The report ID
   * @param expirationMinutes Optional expiration time in minutes (defaults to configured value)
   * @returns Base64-encoded signed token
   */
  generateToken(attachmentId: string, reportId: string, expirationMinutes?: number): string {
    const expiresAt = Date.now() + (expirationMinutes || this.defaultExpirationMinutes) * 60 * 1000;
    
    const payload: TokenPayload = {
      attachmentId,
      reportId,
      expiresAt
    };

    // Create a signed token using HMAC
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payloadString)
      .digest('hex');

    // Combine payload and signature
    const tokenData = {
      payload: payload,
      signature: signature
    };

    // Encode to base64 for URL-safe transmission
    return Buffer.from(JSON.stringify(tokenData)).toString('base64url');
  }

  /**
   * Validate and decode a token
   * @param token The token to validate
   * @returns Decoded payload if valid, null if invalid or expired
   */
  validateToken(token: string): TokenPayload | null {
    try {
      // Decode from base64
      const tokenData = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
      
      // Verify signature
      const payloadString = JSON.stringify(tokenData.payload);
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(payloadString)
        .digest('hex');

      if (tokenData.signature !== expectedSignature) {
        return null; // Invalid signature
      }

      // Check expiration
      if (Date.now() > tokenData.payload.expiresAt) {
        return null; // Token expired
      }

      return tokenData.payload;
    } catch (error) {
      return null; // Invalid token format
    }
  }

  /**
   * Generate a signed URL (for future cloud storage integration)
   * This is a placeholder for cloud storage signed URLs (S3, Azure, etc.)
   */
  generateSignedUrl(filePath: string, expirationMinutes: number = 60): string {
    // In a real implementation with cloud storage, this would generate
    // a pre-signed URL from the storage provider
    // For now, we'll use token-based access via our API
    const token = this.generateToken('', '', expirationMinutes);
    return `/api/download?token=${token}&path=${encodeURIComponent(filePath)}`;
  }
}

