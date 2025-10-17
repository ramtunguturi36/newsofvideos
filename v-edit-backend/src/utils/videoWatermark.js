import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import os from "os";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Add text watermark to video using ffmpeg
 * @param {Buffer} videoBuffer - Input video buffer
 * @param {string} watermarkText - Text to overlay on video
 * @returns {Promise<Buffer>} - Watermarked video buffer
 */
export async function addVideoWatermark(
  videoBuffer,
  watermarkText = "PREVIEW ONLY - DO NOT COPY",
) {
  let inputPath = null;
  let outputPath = null;

  try {
    // Create temporary directory if it doesn't exist
    const tempDir = path.join(os.tmpdir(), "video-watermarks");
    await fs.mkdir(tempDir, { recursive: true });

    // Create temporary file paths
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    inputPath = path.join(tempDir, `input-${timestamp}-${random}.mp4`);
    outputPath = path.join(tempDir, `output-${timestamp}-${random}.mp4`);

    // Write input buffer to temporary file
    await fs.writeFile(inputPath, videoBuffer);

    // Build ffmpeg command with text watermark overlay
    // The drawtext filter adds text overlay to the video
    const escapedText = watermarkText.replace(/'/g, "\\'").replace(/:/g, "\\:");

    const ffmpegCommand = `ffmpeg -i "${inputPath}" -vf "drawtext=text='${escapedText}':fontcolor=white@0.8:fontsize=40:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black@0.8:shadowx=2:shadowy=2:box=1:boxcolor=black@0.5:boxborderw=10" -codec:a copy "${outputPath}"`;

    console.log("🎬 Running ffmpeg watermark command...");

    // Execute ffmpeg command
    const { stdout, stderr } = await execAsync(ffmpegCommand, {
      maxBuffer: 1024 * 1024 * 100, // 100MB buffer
    });

    if (stderr) {
      console.log("FFmpeg stderr:", stderr);
    }

    // Read the watermarked video
    const watermarkedBuffer = await fs.readFile(outputPath);

    console.log("✅ Video watermark added successfully");

    return watermarkedBuffer;
  } catch (error) {
    console.error("❌ Error adding video watermark:", error);
    console.error("Error details:", error.message);

    // If ffmpeg fails, return original video
    console.warn("⚠️  Returning original video without watermark");
    return videoBuffer;
  } finally {
    // Clean up temporary files
    try {
      if (inputPath) {
        await fs.unlink(inputPath).catch(() => {});
      }
      if (outputPath) {
        await fs.unlink(outputPath).catch(() => {});
      }
    } catch (cleanupError) {
      console.error("Error cleaning up temp files:", cleanupError);
    }
  }
}

/**
 * Add diagonal watermark pattern to video
 * @param {Buffer} videoBuffer - Input video buffer
 * @param {string} watermarkText - Text to overlay on video
 * @returns {Promise<Buffer>} - Watermarked video buffer
 */
export async function addDiagonalVideoWatermark(
  videoBuffer,
  watermarkText = "PREVIEW",
) {
  let inputPath = null;
  let outputPath = null;

  try {
    const tempDir = path.join(os.tmpdir(), "video-watermarks");
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    inputPath = path.join(tempDir, `input-${timestamp}-${random}.mp4`);
    outputPath = path.join(tempDir, `output-${timestamp}-${random}.mp4`);

    await fs.writeFile(inputPath, videoBuffer);

    const escapedText = watermarkText.replace(/'/g, "\\'").replace(/:/g, "\\:");

    // Create a repeating diagonal watermark pattern
    const ffmpegCommand = `ffmpeg -i "${inputPath}" -vf "drawtext=text='${escapedText}':fontcolor=white@0.3:fontsize=30:x='mod(n,2)*w/2':y='h/2':shadowcolor=black@0.3:shadowx=2:shadowy=2" -codec:a copy "${outputPath}"`;

    console.log("🎬 Running diagonal ffmpeg watermark command...");

    await execAsync(ffmpegCommand, {
      maxBuffer: 1024 * 1024 * 100,
    });

    const watermarkedBuffer = await fs.readFile(outputPath);

    console.log("✅ Diagonal video watermark added successfully");

    return watermarkedBuffer;
  } catch (error) {
    console.error("❌ Error adding diagonal video watermark:", error);
    return videoBuffer;
  } finally {
    try {
      if (inputPath) await fs.unlink(inputPath).catch(() => {});
      if (outputPath) await fs.unlink(outputPath).catch(() => {});
    } catch (cleanupError) {
      console.error("Error cleaning up temp files:", cleanupError);
    }
  }
}

/**
 * Extract video metadata
 * @param {Buffer} videoBuffer - Input video buffer
 * @returns {Promise<Object>} - Video metadata
 */
export async function getVideoMetadata(videoBuffer) {
  let inputPath = null;

  try {
    const tempDir = path.join(os.tmpdir(), "video-metadata");
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    inputPath = path.join(tempDir, `input-${timestamp}-${random}.mp4`);

    await fs.writeFile(inputPath, videoBuffer);

    // Use ffprobe to get video metadata
    const ffprobeCommand = `ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`;

    const { stdout } = await execAsync(ffprobeCommand);
    const metadata = JSON.parse(stdout);

    const videoStream = metadata.streams.find((s) => s.codec_type === "video");

    return {
      duration: parseFloat(metadata.format.duration) || 0,
      width: videoStream?.width || 0,
      height: videoStream?.height || 0,
      fps: eval(videoStream?.r_frame_rate || "0/1"),
      format: metadata.format.format_name || "unknown",
      fileSize: parseInt(metadata.format.size) || 0,
    };
  } catch (error) {
    console.error("Error getting video metadata:", error);
    return {
      duration: 0,
      width: 0,
      height: 0,
      fps: 0,
      format: "unknown",
      fileSize: videoBuffer.length,
    };
  } finally {
    try {
      if (inputPath) await fs.unlink(inputPath).catch(() => {});
    } catch (cleanupError) {
      console.error("Error cleaning up temp files:", cleanupError);
    }
  }
}
