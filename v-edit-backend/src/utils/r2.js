import { S3Client, PutObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function uploadToR2({ bucket, key, contentType, body }) {
  try {
    console.log('Uploading to R2:', { bucket, key, contentType });
    
    // Debug: Log environment variables
    console.log('🔍 R2 Environment Debug:', {
      endpoint: process.env.R2_ENDPOINT ? 'SET' : 'MISSING',
      accessKeyId: process.env.R2_ACCESS_KEY_ID ? `SET (${process.env.R2_ACCESS_KEY_ID.substring(0, 4)}...)` : 'MISSING',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ? `SET (${process.env.R2_SECRET_ACCESS_KEY.substring(0, 4)}...)` : 'MISSING',
      bucket: process.env.R2_BUCKET ? 'SET' : 'MISSING'
    });
    
    // Validate credentials
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Missing R2 credentials');
    }
    
    // Create S3Client with current environment variables
    const r2 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT?.trim(),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    
    // Upload the file directly to R2
    await r2.send(
      new PutObjectCommand({ 
        Bucket: bucket, 
        Key: key, 
        Body: body, 
        ContentType: contentType 
      })
    );
    
    console.log('✅ Upload successful!');
    
    // Use public URL since you have R2_PUBLIC_BASE_URL configured
    const publicBase = process.env.R2_PUBLIC_BASE_URL?.trim();
    if (publicBase) {
      const finalUrl = `${publicBase}/${key}`;
      console.log('Using public URL:', finalUrl);
      return finalUrl;
    }
    
    // Fallback to signed URL (though this might not work with current permissions)
    console.log('Generating signed URL...');
    const url = await getSignedUrl(
      r2,
      new PutObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: 3600 }
    );
    
    console.log('Using signed URL:', url);
    return url;
    
  } catch (error) {
    console.error('❌ R2 Upload Error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('Access Denied')) {
      console.error('🔧 Fix: Update R2 API token with Object Read/Write permissions');
    } else if (error.message.includes('credential')) {
      console.error('🔧 Fix: Check R2 credentials in .env file');
    } else if (error.message.includes('NoSuchBucket')) {
      console.error('🔧 Fix: Create bucket "' + bucket + '" in Cloudflare R2');
    }
    
    throw error;
  }
}

/**
 * Copy an existing object within the same R2 bucket (server-side, no re-upload)
 * @param {{ bucket: string; sourceKey: string; destKey: string; contentType?: string }} params
 * @returns {Promise<string>} - Public URL of the copied object
 */
export async function copyInR2({ bucket, sourceKey, destKey, contentType }) {
  try {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Missing R2 credentials');
    }

    const r2 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT?.trim(),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    await r2.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `/${bucket}/${sourceKey}`,
        Key: destKey,
        ContentType: contentType,
        MetadataDirective: 'REPLACE', // ensure content-type is set if provided
      })
    );

    const publicBase = process.env.R2_PUBLIC_BASE_URL?.trim();
    if (publicBase) {
      return `${publicBase}/${destKey}`;
    }
    // Fallback: return S3 path style
    return `${process.env.R2_ENDPOINT?.trim()}/${bucket}/${destKey}`;
  } catch (error) {
    console.error('❌ R2 Copy Error:', error.message);
    throw error;
  }
}


