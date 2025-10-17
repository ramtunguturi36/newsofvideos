# Video & Audio Marketplace - Quick Setup Guide

## 🚀 Quick Start

This guide helps you set up the new Video and Audio marketplace features.

---

## 📋 Prerequisites

### Required:
- Node.js (v16+)
- MongoDB Atlas account
- Cloudflare R2 bucket
- Razorpay account

### Optional (for watermarking):
- **FFmpeg** - Required for video watermarking
- **espeak** - Optional for audio voice watermarking

---

## 🔧 Backend Setup

### 1. Install FFmpeg (Required for Video Watermarking)

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

**Verify Installation:**
```bash
ffmpeg -version
ffprobe -version
```

### 2. Install espeak (Optional for Audio Watermarking)

**Windows:**
```bash
# Download from http://espeak.sourceforge.net/
# Note: Audio watermarking will gracefully fall back if not available
```

**Mac:**
```bash
brew install espeak
```

**Linux:**
```bash
sudo apt-get install espeak
```

### 3. Environment Variables

Your `.env` file already has most settings. Ensure these are set:

```env
# Existing settings
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET=your_r2_bucket_name
R2_PUBLIC_BASE_URL=https://cdn.example.com

# No new environment variables needed!
```

### 4. Install Dependencies

```bash
cd v-edit-backend
npm install
```

The existing dependencies already include everything needed:
- `multer` - File uploads
- `@aws-sdk/client-s3` - R2 storage
- `sharp` - Image processing (for thumbnails)

### 5. Start Backend

```bash
# Development
npm run dev

# Production
npm start
```

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd v-edit-frontend
npm install
```

### 2. Start Frontend

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

---

## 🧪 Testing the Implementation

### 1. Access the Application

Open browser: `http://localhost:5173`

### 2. Login as Admin

Navigate to `/login/admin` and login with admin credentials.

### 3. Test Video Upload (Admin)

**Manual Test via API:**

```bash
# Create a video folder
curl -X POST http://localhost:5000/api/video-content/video-folders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Video Folder",
    "category": "animations",
    "description": "Testing video uploads"
  }'

# Upload video content
curl -X POST http://localhost:5000/api/video-content/video-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Video" \
  -F "basePrice=99" \
  -F "category=animations" \
  -F "video=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumbnail.jpg"
```

### 4. Test Audio Upload (Admin)

```bash
# Create an audio folder
curl -X POST http://localhost:5000/api/audio-content/audio-folders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Audio Folder",
    "category": "music",
    "description": "Testing audio uploads"
  }'

# Upload audio content
curl -X POST http://localhost:5000/api/audio-content/audio-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Song" \
  -F "basePrice=49" \
  -F "category=music" \
  -F "artist=Test Artist" \
  -F "audio=@/path/to/audio.mp3" \
  -F "thumbnail=@/path/to/cover.jpg"
```

### 5. Test User Flow

1. **Register/Login** as a regular user
2. Navigate to **Video Content** (`/video-content`)
3. Browse folders and videos
4. Preview a video (should show watermark)
5. Add to cart and purchase
6. Go to **My Video Content** (`/user/video-content`)
7. Download the purchased video (no watermark)

Repeat for audio content.

---

## 📍 Available Routes

### Public Routes (No Auth Required):
```
GET  /video-content              - Browse videos
GET  /audio-content              - Browse audio
GET  /video-content?folderId=ID  - Browse video folder
GET  /audio-content?folderId=ID  - Browse audio folder
```

### User Routes (Auth Required):
```
GET  /user/video-content         - My purchased videos
GET  /user/audio-content         - My purchased audio
```

### Admin Routes (Admin Auth Required):
```
POST   /api/video-content/video-folders     - Create video folder
POST   /api/video-content/video-content     - Upload video
GET    /api/video-content/video-hierarchy   - Get hierarchy
PUT    /api/video-content/video-content/:id - Update video
DELETE /api/video-content/video-content/:id - Delete video

POST   /api/audio-content/audio-folders     - Create audio folder
POST   /api/audio-content/audio-content     - Upload audio
GET    /api/audio-content/audio-hierarchy   - Get hierarchy
PUT    /api/audio-content/audio-content/:id - Update audio
DELETE /api/audio-content/audio-content/:id - Delete audio
```

---

## 🎯 Features Implemented

### Video Marketplace:
✅ Upload videos with automatic watermarking
✅ Hierarchical folder organization
✅ Video preview with watermark
✅ Purchase and download full quality
✅ Search by title, description, tags
✅ Filter by category (animations, tutorials, music-videos, commercials, documentaries)
✅ Sort by name, date, or price
✅ Grid/List view toggle
✅ Video metadata (duration, resolution, format, file size)

### Audio Marketplace:
✅ Upload audio (optional watermarking)
✅ Hierarchical folder organization
✅ Audio preview with player
✅ Purchase and download full quality
✅ Search by title, artist, album, tags
✅ Filter by category (audiobooks, music, podcasts, sound-effects, ambient)
✅ Sort by name, date, or price
✅ Grid/List view toggle
✅ Audio metadata (duration, bitrate, format, artist, album)

---

## 🐛 Troubleshooting

### Video Upload Fails with "FFmpeg not found"

**Solution:** Install FFmpeg (see step 1 above) and restart the backend server.

```bash
# Verify FFmpeg is in PATH
ffmpeg -version
```

### Video Watermarking Takes Too Long

**Issue:** Large video files take time to process.

**Solutions:**
- Increase timeout in `backend.ts`:
  ```javascript
  timeout: 300000, // 5 minutes
  ```
- Use smaller video files for testing
- Consider background job processing for production

### Audio Watermarking Warnings

**Issue:** "espeak not found" warnings in console.

**Solution:** This is normal. Audio watermarking is optional. Install espeak if you want voice watermarks, otherwise the system will use original audio for previews.

### Upload Fails with "File too large"

**Solution:** Increase file size limit in routes:

```javascript
// In videoContent.js or audioContent.js
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 1000 * 1000 * 100 } // 100MB
})
```

### Videos Don't Play in Browser

**Issue:** Browser doesn't support video format.

**Solution:** 
- Use MP4 format with H.264 codec (most compatible)
- Convert videos: `ffmpeg -i input.mov -c:v libx264 output.mp4`

---

## 📊 Supported Formats

### Video Formats:
- ✅ MP4 (recommended)
- ✅ MOV
- ✅ AVI
- ✅ WEBM
- ✅ MKV

### Audio Formats:
- ✅ MP3 (recommended)
- ✅ WAV
- ✅ AAC
- ✅ FLAC
- ✅ OGG
- ✅ M4A

---

## 🔒 Security Notes

1. **Watermarked Previews:** All preview videos have "PREVIEW ONLY" watermark
2. **Download URLs:** Only accessible after purchase verification
3. **File Validation:** Server validates file types and sizes
4. **Admin Only Uploads:** Only admin users can upload content
5. **JWT Protected:** All sensitive endpoints require authentication

---

## 🎨 Customization

### Change Watermark Text:

**Backend (videoContent.js):**
```javascript
const watermarkedVideo = await addVideoWatermark(
  videoFile.buffer, 
  'YOUR CUSTOM TEXT' // Change this
)
```

### Change File Size Limits:

**Backend (videoContent.js, audioContent.js):**
```javascript
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 1000 * 1000 * YOUR_SIZE_MB }
})
```

### Add New Categories:

**Backend Model (VideoContent.js):**
```javascript
category: {
  type: String,
  enum: ['animations', 'tutorials', 'YOUR_NEW_CATEGORY'],
  default: 'other'
}
```

**Frontend (VideoExplorer.tsx):**
```jsx
<option value="your-new-category">🎯 Your New Category</option>
```

---

## 📚 Additional Resources

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Razorpay Docs](https://razorpay.com/docs/)

---

## 🆘 Need Help?

### Common Issues:

1. **"Cannot find module" errors:** Run `npm install` in backend
2. **CORS errors:** Check `server.js` allowed origins
3. **Payment failures:** Verify Razorpay keys in `.env`
4. **R2 upload fails:** Check R2 credentials and bucket permissions

### Debug Mode:

Enable detailed logging in backend:
```javascript
console.log('🎬 Processing video upload...');
console.log('Video metadata:', metadata);
console.log('💧 Adding watermark...');
```

---

## ✅ Verification Checklist

- [ ] FFmpeg installed and working
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected successfully
- [ ] R2 bucket accessible
- [ ] Can upload video as admin
- [ ] Can upload audio as admin
- [ ] Video watermark appears in preview
- [ ] Can search and filter content
- [ ] Can add to cart and checkout
- [ ] Can download purchased content
- [ ] Downloaded videos have no watermark

---

## 🎉 You're All Set!

The Video and Audio marketplace is now ready to use. Start uploading content as admin and test the full user flow.

**Quick Links:**
- Video Explorer: http://localhost:5173/video-content
- Audio Explorer: http://localhost:5173/audio-content
- Admin Login: http://localhost:5173/login/admin
- User Dashboard: http://localhost:5173/user/dashboard

**Happy Coding! 🚀**