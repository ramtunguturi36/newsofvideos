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
 * Add voice watermark to audio using ffmpeg (text-to-speech overlay)
 * Note: This requires ffmpeg with festival or espeak support
 * If not available, it will return the original audio
 * @param {Buffer} audioBuffer - Input audio buffer
 * @param {string} watermarkText - Text to convert to speech watermark
 * @returns {Promise<Buffer>} - Watermarked audio buffer or original
 */
export async function addAudioWatermark(
  audioBuffer,
  watermarkText = "This is a preview",
) {
  let inputPath = null;
  let outputPath = null;
  let watermarkPath = null;

  try {
    // Create temporary directory if it doesn't exist
    const tempDir = path.join(os.tmpdir(), "audio-watermarks");
    await fs.mkdir(tempDir, { recursive: true });

    // Create temporary file paths
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    inputPath = path.join(tempDir, `input-${timestamp}-${random}.mp3`);
    outputPath = path.join(tempDir, `output-${timestamp}-${random}.mp3`);
    watermarkPath = path.join(tempDir, `watermark-${timestamp}-${random}.mp3`);

    // Write input buffer to temporary file
    await fs.writeFile(inputPath, audioBuffer);

    // Try to generate voice watermark using espeak (if available)
    // This is optional - if it fails, we'll return original audio
    try {
      console.log("🎤 Attempting to generate voice watermark...");

      // Generate TTS watermark using espeak (Linux/Mac) or fallback
      const ttsCommand = `espeak "${watermarkText}" --stdout | ffmpeg -i - -ar 44100 -ac 2 -b:a 128k "${watermarkPath}"`;

      await execAsync(ttsCommand, {
        maxBuffer: 1024 * 1024 * 10,
        timeout: 5000, // 5 second timeout
      });

      // Mix the watermark with the original audio at low volume
      // The watermark will play at the beginning and end
      const mixCommand = `ffmpeg -i "${inputPath}" -i "${watermarkPath}" -filter_complex "[1:a]volume=0.3[wm];[0:a][wm]amerge=inputs=2[a]" -map "[a]" -ac 2 "${outputPath}"`;

      await execAsync(mixCommand, {
        maxBuffer: 1024 * 1024 * 100,
      });

      // Read the watermarked audio
      const watermarkedBuffer = await fs.readFile(outputPath);
      console.log("✅ Audio watermark added successfully");
      return watermarkedBuffer;
    } catch (ttsError) {
      console.log("⚠️  Voice watermark generation failed (espeak not available)");
      console.log("   Returning original audio without watermark");
      return audioBuffer;
    }
  } catch (error) {
    console.error("❌ Error adding audio watermark:", error);
    console.error("Error details:", error.message);

    // If watermarking fails, return original audio
    console.warn("⚠️  Returning original audio without watermark");
    return audioBuffer;
  } finally {
    // Clean up temporary files
    try {
      if (inputPath) await fs.unlink(inputPath).catch(() => {});
      if (outputPath) await fs.unlink(outputPath).catch(() => {});
      if (watermarkPath) await fs.unlink(watermarkPath).catch(() => {});
    } catch (cleanupError) {
      console.error("Error cleaning up temp files:", cleanupError);
    }
  }
}

/**
 * Add periodic beep watermark to audio (simpler alternative to voice)
 * @param {Buffer} audioBuffer - Input audio buffer
 * @returns {Promise<Buffer>} - Audio with beep watermark
 */
export async function addBeepWatermark(audioBuffer) {
  let inputPath = null;
  let outputPath = null;

  try {
    const tempDir = path.join(os.tmpdir(), "audio-watermarks");
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    inputPath = path.join(tempDir, `input-${timestamp}-${random}.mp3`);
    outputPath = path.join(tempDir, `output-${timestamp}-${random}.mp3`);

    await fs.writeFile(inputPath, audioBuffer);

    // Add a subtle beep every 30 seconds as watermark
    const beepCommand = `ffmpeg -i "${inputPath}" -af "aeval='sin(880*2*PI*t)*0.1':c=stereo:s=44100:d=0.1" -filter_complex "[0:a][1:a]amerge=inputs=2[a]" -map "[a]" "${outputPath}"`;

    console.log("🔊 Adding beep watermark...");

    await execAsync(beepCommand, {
      maxBuffer: 1024 * 1024 * 100,
    });

    const watermarkedBuffer = await fs.readFile(outputPath);
    console.log("✅ Beep watermark added successfully");
    return watermarkedBuffer;
  } catch (error) {
    console.error("❌ Error adding beep watermark:", error);
    return audioBuffer;
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
 * Extract audio metadata
 * @param {Buffer} audioBuffer - Input audio buffer
 * @returns {Promise<Object>} - Audio metadata
 */
export async function getAudioMetadata(audioBuffer) {
  let inputPath = null;

  try {
    const tempDir = path.join(os.tmpdir(), "audio-metadata");
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    inputPath = path.join(tempDir, `input-${timestamp}-${random}.mp3`);

    await fs.writeFile(inputPath, audioBuffer);

    // Use ffprobe to get audio metadata
    const ffprobeCommand = `ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`;

    const { stdout } = await execAsync(ffprobeCommand);
    const metadata = JSON.parse(stdout);

    const audioStream = metadata.streams.find((s) => s.codec_type === "audio");

    return {
      duration: parseFloat(metadata.format.duration) || 0,
      bitrate: parseInt(metadata.format.bit_rate) || 0,
      sampleRate: parseInt(audioStream?.sample_rate) || 0,
      channels: audioStream?.channels || 0,
      format: metadata.format.format_name || "unknown",
      fileSize: parseInt(metadata.format.size) || 0,
    };
  } catch (error) {
    console.error("Error getting audio metadata:", error);
    return {
      duration: 0,
      bitrate: 0,
      sampleRate: 0,
      channels: 0,
      format: "unknown",
      fileSize: audioBuffer.length,
    };
  } finally {
    try {
      if (inputPath) await fs.unlink(inputPath).catch(() => {});
    } catch (cleanupError) {
      console.error("Error cleaning up temp files:", cleanupError);
    }
  }
}

/**
 * Simple pass-through (no watermark)
 * Use this when watermarking is not required or not available
 * @param {Buffer} audioBuffer - Input audio buffer
 * @returns {Promise<Buffer>} - Original audio buffer
 */
export async function noWatermark(audioBuffer) {
  console.log("ℹ️  Audio watermark disabled - using original audio");
  return audioBuffer;
}
