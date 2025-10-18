import express from "express";
import https from "https";
import http from "http";
import { URL } from "url";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/download-proxy", authMiddleware, async (req, res) => {
  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).json({ message: "URL parameter is required" });
    }

    console.log("📥 Download proxy request:", { url, filename });

    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === "https:" ? https : http;

    // Make request to R2
    const request = protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        console.error("❌ Failed to fetch file, status:", response.statusCode);
        return res
          .status(response.statusCode)
          .json({ message: "Failed to fetch file" });
      }

      // Set headers to force download
      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      const finalFilename = filename || "download";

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${finalFilename}"`,
      );
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

      if (response.headers["content-length"]) {
        res.setHeader("Content-Length", response.headers["content-length"]);
      }

      // Pipe the file stream to the response
      response.pipe(res);

      response.on("error", (error) => {
        console.error("❌ Stream error:", error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error streaming file" });
        }
      });
    });

    request.on("error", (error) => {
      console.error("❌ Request error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    console.error("❌ Download proxy error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error downloading file" });
    }
  }
});

export default router;
