import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// Check if credentials are placeholder
const isPlaceholder = (str?: string) => {
  return !str || str.includes('your_') || str.includes('placeholder') || str === '';
};

const hasRealCredentials = 
  !isPlaceholder(process.env.R2_ACCOUNT_ID) &&
  !isPlaceholder(process.env.R2_ACCESS_KEY_ID) &&
  !isPlaceholder(process.env.R2_SECRET_ACCESS_KEY) &&
  !isPlaceholder(process.env.R2_BUCKET_NAME);

let s3Client: S3Client | null = null;

if (hasRealCredentials) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
} else {
  console.warn('[R2] Placeholder or missing credentials detected. Using MOCK storage fallback.');
}

/**
 * Validates file type using magic bytes
 */
export const validateImageMagicBytes = (buffer: Buffer): boolean => {
  if (buffer.length < 4) return false;
  
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return true;
  }
  
  // JPEG/JPG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }
  
  // WebP: RIFF (52 49 46 46) ... WEBP (57 45 42 50) at offset 8
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    const webpHeader = buffer.toString('ascii', 8, 12);
    if (webpHeader === 'WEBP') {
      return true;
    }
  }
  
  return false;
};

/**
 * Uploads file buffer to R2 or returns a mock URL if credentials are not configured
 */
export const uploadToR2 = async (
  buffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<string> => {
  const extension = originalFilename.split('.').pop() || 'jpg';
  const fileKey = `${crypto.randomUUID()}.${extension}`;

  if (s3Client) {
    const bucket = process.env.R2_BUCKET_NAME!;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        Body: buffer,
        ContentType: contentType,
      })
    );
    
    const publicUrl = process.env.R2_PUBLIC_URL || `https://pub-placeholder.r2.dev`;
    // Clean trailing slash
    const baseUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
    return `${baseUrl}/${fileKey}`;
  } else {
    // Return mock URL
    return `https://mock-r2-storage.foodmart.com/uploads/${fileKey}`;
  }
};

/**
 * Deletes a file from R2 (or does nothing if mock)
 */
export const deleteFromR2 = async (fileUrl: string): Promise<void> => {
  if (!s3Client || !fileUrl) return;

  // Extract key from URL
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // remove leading slash
    
    if (key && !fileUrl.includes('mock-r2-storage')) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
        })
      );
    }
  } catch (e) {
    console.error('Failed to delete from R2:', e);
  }
};
