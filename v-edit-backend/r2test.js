import dotenv from "dotenv";
import { S3Client, ListObjectsV2Command, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

dotenv.config({ path: "./.env" }); // adjust if .env is elsewhere

// Debug: check env variables
console.log("🔹 Loaded ENV variables:");
console.log({
  endpoint: process.env.R2_ENDPOINT,
  accessKey: process.env.R2_ACCESS_KEY_ID ? "LOADED" : "MISSING",
  secretKey: process.env.R2_SECRET_ACCESS_KEY ? "LOADED" : "MISSING",
  bucket: process.env.R2_BUCKET,
  publicBase: process.env.R2_PUBLIC_BASE_URL,
});

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT?.trim(),
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim(),
  },
});

async function testR2Connection() {
  try {
    console.log("\n🔹 Testing bucket existence...");
    await s3.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET }));
    console.log("✅ Bucket exists!");

    console.log("\n🔹 Listing objects in bucket...");
    const list = await s3.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET, MaxKeys: 5 }));
    console.log("Objects in bucket:", list.Contents?.map(o => o.Key) || "Empty");

    console.log("\n🔹 Testing file upload...");
    const testKey = "r2-test-file.txt";
    const body = "Hello from R2 test!";
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: testKey,
      Body: body,
      ContentType: "text/plain",
    }));
    console.log(`✅ Upload successful: ${testKey}`);
    
    const publicBase = process.env.R2_PUBLIC_BASE_URL?.trim();
    if (publicBase) console.log("Public URL:", `${publicBase}/${testKey}`);
    
  } catch (err) {
    console.error("❌ R2 Test Error:", err);
    if (err.message.includes("Access Denied")) {
      console.error("🔧 Check R2 API token permissions (Object Read/Write)");
    } else if (err.message.includes("credential")) {
      console.error("🔧 Check R2 credentials in .env file");
    } else if (err.message.includes("NoSuchBucket")) {
      console.error(`🔧 Create bucket "${process.env.R2_BUCKET}" in Cloudflare R2`);
    }
  }
}

// Run the test
testR2Connection();
