# Testing Checklist - Video & Audio Marketplace

## ✅ Pre-Testing Setup

### 1. Verify FFmpeg Installation
```bash
ffmpeg -version
ffprobe -version
```
- [ ] FFmpeg installed and accessible
- [ ] FFprobe working

### 2. Start Backend Server
```bash
cd v-edit-backend
npm install
npm run dev
```
- [ ] Server running on port 5000
- [ ] MongoDB connected
- [ ] No startup errors

### 3. Start Frontend Server
```bash
cd v-edit-frontend
npm install
npm run dev
```
- [ ] Frontend running on port 5173
- [ ] No compilation errors

---

## 🔐 Admin Authentication

### Login
- [ ] Navigate to `http://localhost:5173/login/admin`
- [ ] Enter admin credentials
- [ ] Successfully redirected to admin dashboard
- [ ] Token stored in localStorage

---

## 🎬 Video Content Testing

### Access Video Content Manager
- [ ] Click "Video Content" in admin sidebar
- [ ] Page loads at `/admin/video-content`
- [ ] Shows "Video Content Manager" header
- [ ] Displays empty state if no content

### Create Video Folder
- [ ] Click "New Folder" button
- [ ] Modal opens with form
- [ ] Fill in folder name (e.g., "Test Animations")
- [ ] Select category (e.g., "Animations")
- [ ] Add description (optional)
- [ ] Click "Create Folder"
- [ ] Success toast appears
- [ ] Folder appears in grid

### Upload Video
- [ ] Click "Upload Video" button
- [ ] Modal opens with form
- [ ] Fill in title (e.g., "Test Video 1")
- [ ] Add description (optional)
- [ ] Select category
- [ ] Set base price (e.g., 99)
- [ ] Toggle discount switch ON
- [ ] Set discount price (e.g., 79)
- [ ] Select video file (.mp4, .mov, etc., max 50MB)
- [ ] Select thumbnail image (optional)
- [ ] Click "Upload Video"
- [ ] Shows "Uploading..." state
- [ ] Wait for watermark processing
- [ ] Success toast: "Video uploaded successfully! Watermark has been applied."
- [ ] Video appears in grid with thumbnail

### Verify Video Watermark
- [ ] Click "Preview" button on uploaded video
- [ ] Video opens in new tab
- [ ] Video plays with watermark visible
- [ ] Watermark text: "PREVIEW ONLY - DO NOT COPY"
- [ ] Watermark centered on video

### Edit Video
- [ ] Click edit (pencil icon) on a video
- [ ] Modal opens with pre-filled data
- [ ] Change title, description, or price
- [ ] Click "Update Video"
- [ ] Success toast appears
- [ ] Changes reflected in grid

### Navigate Into Folder
- [ ] Click on folder card
- [ ] URL changes to include `?folderId=...`
- [ ] Breadcrumb shows folder path
- [ ] Shows contents of folder (empty or with videos)
- [ ] Can upload videos to this folder

### Navigate Back
- [ ] Click "Video Content" in breadcrumb
- [ ] Returns to root level
- [ ] Shows all root folders and videos

### Delete Video
- [ ] Click delete (trash icon) on a video
- [ ] Confirmation modal appears
- [ ] Click "Delete"
- [ ] Success toast appears
- [ ] Video removed from grid

### Delete Folder (with contents)
- [ ] Try to delete folder with videos inside
- [ ] Delete button disabled OR
- [ ] Error message: "Cannot delete folder... contains X video(s)"
- [ ] Folder not deleted

### Delete Empty Folder
- [ ] Delete all videos from folder first
- [ ] Click delete on empty folder
- [ ] Confirmation modal appears
- [ ] Click "Delete"
- [ ] Success toast appears
- [ ] Folder removed from grid

---

## 🎵 Audio Content Testing

### Access Audio Content Manager
- [ ] Click "Audio Content" in admin sidebar
- [ ] Page loads at `/admin/audio-content`
- [ ] Shows "Audio Content Manager" header
- [ ] Displays empty state if no content

### Create Audio Folder
- [ ] Click "New Folder" button
- [ ] Modal opens with form
- [ ] Fill in folder name (e.g., "Test Music")
- [ ] Select category (e.g., "Music")
- [ ] Add description (optional)
- [ ] Click "Create Folder"
- [ ] Success toast appears
- [ ] Folder appears in grid

### Upload Audio
- [ ] Click "Upload Audio" button
- [ ] Modal opens with form
- [ ] Fill in title (e.g., "Test Song 1")
- [ ] Add description (optional)
- [ ] Select category (e.g., "Music")
- [ ] Enter artist name (e.g., "Test Artist")
- [ ] Enter album name (e.g., "Test Album")
- [ ] Set base price (e.g., 49)
- [ ] Toggle discount switch ON
- [ ] Set discount price (e.g., 39)
- [ ] Select audio file (.mp3, .wav, etc., max 50MB)
- [ ] Select cover art image (optional)
- [ ] Click "Upload Audio"
- [ ] Shows "Uploading..." state
- [ ] Success toast: "Audio uploaded successfully!"
- [ ] Audio appears in grid with cover art or disc icon

### Verify Audio Preview
- [ ] Click "Play" button on uploaded audio
- [ ] Audio opens in new tab OR plays inline
- [ ] Audio plays without issues
- [ ] Duration displayed correctly

### Edit Audio
- [ ] Click edit (pencil icon) on audio
- [ ] Modal opens with pre-filled data
- [ ] Artist and album fields show correctly
- [ ] Change title, artist, or price
- [ ] Click "Update Audio"
- [ ] Success toast appears
- [ ] Changes reflected in grid

### Navigate Into Folder
- [ ] Click on folder card
- [ ] URL changes to include `?folderId=...`
- [ ] Breadcrumb shows folder path
- [ ] Shows audio tracks in folder

### Delete Audio
- [ ] Click delete (trash icon) on audio
- [ ] Confirmation modal appears
- [ ] Click "Delete"
- [ ] Success toast appears
- [ ] Audio removed from grid

### Delete Empty Folder
- [ ] Delete all audio from folder
- [ ] Click delete on empty folder
- [ ] Success toast appears
- [ ] Folder removed from grid

---

## 🛍️ User-Side Testing

### Browse Video Content (Public)
- [ ] Logout from admin
- [ ] Navigate to `/video-content`
- [ ] See all video folders and content
- [ ] Click on folder to navigate
- [ ] Click preview on video
- [ ] See watermarked preview video playing
- [ ] Add video to cart
- [ ] Cart icon shows item count

### Browse Audio Content (Public)
- [ ] Navigate to `/audio-content`
- [ ] See all audio folders and content
- [ ] Click on folder to navigate
- [ ] Click preview on audio
- [ ] Hear audio preview
- [ ] Add audio to cart
- [ ] Cart updates

### Purchase Flow
- [ ] Open cart
- [ ] See all added items (video + audio)
- [ ] Proceed to checkout
- [ ] Complete payment (test mode)
- [ ] Redirected to success page

### Access Purchased Content
- [ ] Login as user
- [ ] Navigate to `/user/video-content`
- [ ] See purchased videos
- [ ] Click download button
- [ ] Video downloads WITHOUT watermark
- [ ] Video plays perfectly

- [ ] Navigate to `/user/audio-content`
- [ ] See purchased audio
- [ ] Audio player shows
- [ ] Can play inline
- [ ] Click download button
- [ ] Audio file downloads

---

## 🐛 Error Testing

### Network Errors
- [ ] Stop backend server
- [ ] Try to upload video
- [ ] Error toast appears
- [ ] Form doesn't clear
- [ ] Can retry after backend restart

### File Size Limits
- [ ] Try to upload video > 50MB
- [ ] Error message appears
- [ ] Upload rejected

### Invalid File Types
- [ ] Try to upload .txt as video
- [ ] File picker blocks OR error shown
- [ ] Upload rejected

### Missing Required Fields
- [ ] Try to create folder without name
- [ ] Validation error appears
- [ ] Form not submitted

- [ ] Try to upload video without title
- [ ] Validation error appears

- [ ] Try to upload video without price
- [ ] Validation error appears

### FFmpeg Not Installed
- [ ] If FFmpeg not available
- [ ] Backend should log error
- [ ] Upload should fail gracefully
- [ ] Error message shown to admin

---

## 🎨 UI/UX Testing

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] All elements visible and usable

### Loading States
- [ ] Upload shows spinner
- [ ] Page load shows skeleton
- [ ] Buttons disable during actions
- [ ] "Uploading..." text appears

### Empty States
- [ ] Empty folder shows helpful message
- [ ] No content shows "No content yet"
- [ ] CTAs present (Create Folder, Upload)

### Theme Consistency
- [ ] Video pages: Purple/Blue gradient
- [ ] Audio pages: Orange/Pink gradient
- [ ] Icons match content type
- [ ] Colors consistent throughout

---

## 📊 Data Validation

### Check Database
```bash
# Connect to MongoDB
# Check collections
```
- [ ] VideoFolder collection exists
- [ ] VideoContent collection exists
- [ ] AudioFolder collection exists
- [ ] AudioContent collection exists
- [ ] Documents have correct schema
- [ ] Prices stored as numbers
- [ ] URLs stored correctly

### Check R2 Storage
- [ ] Login to Cloudflare R2
- [ ] Check `video-previews/` folder
- [ ] Check `video-downloads/` folder
- [ ] Check `video-thumbnails/` folder
- [ ] Check `audio-previews/` folder
- [ ] Check `audio-downloads/` folder
- [ ] Check `audio-thumbnails/` folder
- [ ] Files uploaded successfully
- [ ] File names have timestamps
- [ ] Files publicly accessible via URLs

### Check Console Logs
**Backend Console:**
- [ ] No error messages
- [ ] "Video uploaded successfully" logs
- [ ] "Watermark added successfully" logs
- [ ] FFmpeg command logs (if verbose)

**Browser Console:**
- [ ] No JavaScript errors
- [ ] API calls succeed (200/201 status)
- [ ] No CORS errors
- [ ] No 404 errors for routes

---

## ✅ Success Criteria

All checkboxes above should be checked (✅) for a successful test.

### Critical Issues (Must Fix):
- Backend crashes
- Upload completely fails
- Watermark not applied
- Can't access purchased content
- Payment flow broken

### Minor Issues (Should Fix):
- UI misalignment
- Missing tooltips
- Slow loading
- Console warnings

### Nice to Have:
- Better loading animations
- Progress bars for uploads
- Bulk operations
- Search within folders

---

## 📝 Notes Section

Use this space to document issues found during testing:

### Issue 1:
**Description:** 
**Steps to Reproduce:** 
**Expected:** 
**Actual:** 
**Priority:** 

### Issue 2:
**Description:** 
**Steps to Reproduce:** 
**Expected:** 
**Actual:** 
**Priority:** 

### Issue 3:
**Description:** 
**Steps to Reproduce:** 
**Expected:** 
**Actual:** 
**Priority:** 

---

**Testing Date:** _______________
**Tested By:** _______________
**Backend Version:** _______________
**Frontend Version:** _______________
**Browser:** _______________
**OS:** _______________

---

## 🚀 Ready to Start Testing!

Start from the top and work your way down. Report any issues you encounter and I'll help fix them immediately!

**Good luck! 🎉**