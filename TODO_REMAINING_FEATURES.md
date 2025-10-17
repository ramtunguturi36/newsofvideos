# TODO: Remaining Optional Features

## 🎯 Overview
Core video and audio marketplace features are **COMPLETE**. This document lists optional enhancements that can be added to improve the admin experience and add folder marketplace functionality.

---

## ✅ Completed Features

- ✅ Backend Models (VideoContent, VideoFolder, AudioContent, AudioFolder)
- ✅ Backend Routes (Full CRUD APIs)
- ✅ Watermarking Utilities (Video & Audio)
- ✅ Frontend Explorer Pages (VideoExplorer, AudioExplorer)
- ✅ User Purchased Content Pages (MyVideoContent, MyAudioContent)
- ✅ Cart Integration
- ✅ Purchase Flow
- ✅ Download Functionality
- ✅ Search, Filter, Sort
- ✅ Routing & Navigation

---

## 📋 Remaining Features (Optional)

### Priority 1: Admin Management Pages

#### 1. VideoContentManager.tsx
**Location:** `src/pages/admin/components/VideoContentManager.tsx`

**Features to Implement:**
- [ ] Display all videos in a table/grid view
- [ ] Create new video folder (modal form)
- [ ] Upload video content (form with file pickers)
- [ ] Edit video details (inline or modal)
- [ ] Delete videos with confirmation
- [ ] Move videos between folders (drag & drop or dropdown)
- [ ] Bulk operations (delete, move, price update)
- [ ] Video preview in admin panel
- [ ] Folder hierarchy tree view
- [ ] Search and filter videos
- [ ] Pagination for large datasets

**Similar to:** `PictureTemplatesManager.tsx`

#### 2. AudioContentManager.tsx
**Location:** `src/pages/admin/components/AudioContentManager.tsx`

**Features to Implement:**
- [ ] Display all audio in a table/grid view
- [ ] Create new audio folder (modal form)
- [ ] Upload audio content (form with file pickers)
- [ ] Edit audio details including artist/album
- [ ] Delete audio with confirmation
- [ ] Move audio between folders
- [ ] Bulk operations
- [ ] Audio player in admin panel
- [ ] Folder hierarchy tree view
- [ ] Search and filter audio
- [ ] Pagination

**Similar to:** `PictureTemplatesManager.tsx`

#### 3. Update Admin Dashboard Navigation
**Location:** `src/pages/admin/Dashboard.tsx`

**Updates Needed:**
```tsx
// Add new routes
<Route path="video-content" element={<VideoContentManager />} />
<Route path="audio-content" element={<AudioContentManager />} />

// Add navigation links in sidebar
<Link to="/admin/video-content">
  <Video className="mr-2" /> Video Content
</Link>
<Link to="/admin/audio-content">
  <Music className="mr-2" /> Audio Content
</Link>
```

---

### Priority 2: Folder Marketplace Pages

#### 4. VideoFolderMarketplace.tsx
**Location:** `src/pages/VideoFolderMarketplace.tsx`

**Features to Implement:**
- [ ] Display purchasable video folders
- [ ] Show folder preview with sample videos
- [ ] Display folder pricing (bundle discount)
- [ ] Show total videos in folder
- [ ] Category filter
- [ ] Search folders by name
- [ ] Add folder to cart
- [ ] Folder preview modal with video samples
- [ ] Breadcrumb navigation
- [ ] Grid/List view toggle

**Similar to:** `PictureFolderMarketplace.tsx`

**Backend Requirements:**
- Already supported! Just need to set `isPurchasable: true` on VideoFolder
- Set `basePrice` and optional `discountPrice` on folder

#### 5. AudioFolderMarketplace.tsx
**Location:** `src/pages/AudioFolderMarketplace.tsx`

**Features to Implement:**
- [ ] Display purchasable audio folders
- [ ] Show folder preview with sample tracks
- [ ] Display folder pricing
- [ ] Show total tracks in folder
- [ ] Category filter
- [ ] Search folders by name
- [ ] Add folder to cart
- [ ] Folder preview modal with audio samples
- [ ] Breadcrumb navigation
- [ ] Grid/List view toggle

**Similar to:** `PictureFolderMarketplace.tsx`

#### 6. Update Main Navigation
**Location:** `src/pages/Landing.tsx` or Navigation component

**Add Links:**
```tsx
<Link to="/video-folders">Video Folders</Link>
<Link to="/audio-folders">Audio Folders</Link>
```

**Add Routes in App.tsx:**
```tsx
<Route path="/video-folders" element={<VideoFolderMarketplace />} />
<Route path="/audio-folders" element={<AudioFolderMarketplace />} />
```

---

### Priority 3: User Folder Pages

#### 7. MyVideoFolders.tsx
**Location:** `src/pages/user/MyVideoFolders.tsx`

**Features to Implement:**
- [ ] Display purchased video folders
- [ ] Show all videos in purchased folder
- [ ] Explore folder contents
- [ ] Download all videos in folder (batch)
- [ ] Search within folder
- [ ] Filter by category
- [ ] Access individual videos
- [ ] Show purchase date and price paid

**Similar to:** `MyPictureFolders.tsx`

#### 8. MyAudioFolders.tsx
**Location:** `src/pages/user/MyAudioFolders.tsx`

**Features to Implement:**
- [ ] Display purchased audio folders
- [ ] Show all tracks in purchased folder
- [ ] Explore folder contents
- [ ] Download all audio in folder (batch)
- [ ] Search within folder
- [ ] Filter by category
- [ ] Access individual tracks
- [ ] Show purchase date and price paid

**Similar to:** `MyPictureFolders.tsx`

#### 9. Update User Dashboard Navigation
**Location:** `src/pages/user/UserDashboard.tsx`

**Add Navigation Links:**
```tsx
<Link to="/user/video-folders">My Video Folders</Link>
<Link to="/user/audio-folders">My Audio Folders</Link>
```

**Add Routes in App.tsx:**
```tsx
<Route path="video-folders" element={<MyVideoFolders />} />
<Route path="audio-folders" element={<MyAudioFolders />} />
```

---

## 🎨 Enhanced Features (Future)

### User Experience Enhancements:
- [ ] Video player with quality selection (HD/SD)
- [ ] Audio playlist creation
- [ ] Favorite/bookmark functionality
- [ ] Download history tracking
- [ ] Recently viewed content
- [ ] Continue watching/listening
- [ ] Content recommendations
- [ ] Social sharing for previews
- [ ] Embed codes for previews

### Admin Features:
- [ ] Analytics dashboard
  - [ ] Most viewed videos/audio
  - [ ] Sales by category
  - [ ] Revenue charts
  - [ ] User engagement metrics
- [ ] Bulk import from CSV
- [ ] Scheduled content publishing
- [ ] Content moderation queue
- [ ] Version control for content
- [ ] A/B testing for pricing

### Content Features:
- [ ] Video chapters/timestamps
- [ ] Subtitle support (.srt, .vtt)
- [ ] Multi-language audio tracks
- [ ] Video quality variants (360p, 720p, 1080p)
- [ ] Audio quality variants (128kbps, 320kbps)
- [ ] Compressed download option
- [ ] Streaming optimization

### Community Features:
- [ ] Ratings and reviews system
- [ ] Comment section
- [ ] User-generated playlists
- [ ] Content suggestions
- [ ] Report inappropriate content
- [ ] Creator profiles (if user-generated content)

### Marketing Features:
- [ ] Promotional banners
- [ ] Featured content section
- [ ] New releases section
- [ ] Trending content
- [ ] Limited-time offers
- [ ] Bundle deals
- [ ] Subscription plans
- [ ] Gift cards

---

## 🛠️ Implementation Guide

### For Admin Pages:

1. **Copy `PictureTemplatesManager.tsx` as base**
2. **Replace API calls:**
   - `getPictureHierarchy()` → `getVideoHierarchy()` or `getAudioHierarchy()`
   - `uploadPictureTemplate()` → `uploadVideoContent()` or `uploadAudioContent()`
   - etc.
3. **Update UI elements:**
   - Icons: `Image` → `Video` or `Music`
   - Colors: Pink theme → Purple (video) or Orange (audio)
   - Labels: "Pictures" → "Videos" or "Audio"
4. **Adjust form fields:**
   - Video: Add FPS, resolution fields
   - Audio: Add artist, album fields
5. **Update file inputs:**
   - Accept: `.mp4,.mov,.avi` or `.mp3,.wav,.m4a`
   - Add thumbnail upload

### For Folder Marketplaces:

1. **Copy `PictureFolderMarketplace.tsx` as base**
2. **Update API calls and types**
3. **Change theme colors**
4. **Update preview components:**
   - Video: Show video grid preview
   - Audio: Show track list preview
5. **Add sample content preview modal**

### For User Folder Pages:

1. **Copy `MyPictureFolders.tsx` as base**
2. **Update to fetch purchased folders**
3. **Filter by `video-folder` or `audio-folder` type**
4. **Add folder exploration functionality**
5. **Include batch download feature**

---

## 📦 Code Templates

### Admin Manager Component Structure:
```tsx
// VideoContentManager.tsx
import { getVideoHierarchy, uploadVideoContent, deleteVideoContent } from '@/lib/backend';

const VideoContentManager = () => {
  const [folders, setFolders] = useState<VideoFolder[]>([]);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  
  // Load data
  // Create folder modal
  // Upload video modal
  // Edit/Delete functions
  // Render table/grid
}
```

### Folder Marketplace Component Structure:
```tsx
// VideoFolderMarketplace.tsx
import { getVideoHierarchy } from '@/lib/backend';

const VideoFolderMarketplace = () => {
  const [folders, setFolders] = useState<VideoFolder[]>([]);
  
  // Filter purchasable folders
  const purchasableFolders = folders.filter(f => f.isPurchasable);
  
  // Display grid
  // Preview modal
  // Add to cart
}
```

---

## 🔄 Backend Updates Needed

### For Folder Purchases:

**Update Purchase Flow** (`payments.js`):
- Already supported! Just ensure folder items are handled correctly
- Verify `video-folder` and `audio-folder` types work in cart

**Update Purchases Route** (`purchases.js`):
- Add folder content access
- When user purchases folder, grant access to all videos/audio in folder
- Return all items in purchased folder

**Sample Code:**
```javascript
// In purchases.js
router.get('/folder-contents/:folderId', authMiddleware, async (req, res) => {
  const { folderId } = req.params;
  const userId = req.user.userId;
  
  // Check if user purchased this folder
  const hasPurchased = await Purchase.findOne({
    userId,
    'items.folderId': folderId,
    'items.type': { $in: ['video-folder', 'audio-folder'] }
  });
  
  if (!hasPurchased) {
    return res.status(403).json({ message: 'Folder not purchased' });
  }
  
  // Return all content in folder
  const contents = await VideoContent.find({ folderId });
  return res.json({ contents });
});
```

---

## 📊 Estimated Effort

### Admin Pages (2-3 days):
- VideoContentManager: 1 day
- AudioContentManager: 1 day
- Testing & refinement: 0.5-1 day

### Folder Marketplaces (1-2 days):
- VideoFolderMarketplace: 0.5 day
- AudioFolderMarketplace: 0.5 day
- Integration & testing: 0.5-1 day

### User Folder Pages (1-2 days):
- MyVideoFolders: 0.5 day
- MyAudioFolders: 0.5 day
- Batch download feature: 0.5-1 day

**Total Estimated Time: 4-7 days**

---

## ✅ Implementation Priority

### Must-Have (Core Functionality):
1. ✅ Explorer pages (DONE)
2. ✅ User purchased content pages (DONE)
3. ✅ Purchase flow (DONE)

### Should-Have (Admin Convenience):
4. ⏳ Admin management pages
5. ⏳ Folder marketplaces

### Nice-to-Have (Enhanced UX):
6. ⏳ User folder pages
7. ⏳ Advanced features (playlists, ratings, etc.)

---

## 🎯 Success Criteria

### Admin Pages Complete When:
- [ ] Can create/edit/delete videos via UI
- [ ] Can create/edit/delete audio via UI
- [ ] Can organize content in folders
- [ ] Can preview content before publishing
- [ ] Can set pricing and discounts
- [ ] Bulk operations work smoothly

### Folder Marketplace Complete When:
- [ ] Users can browse purchasable folders
- [ ] Preview shows sample content
- [ ] Can purchase entire folders
- [ ] Correct pricing with bundle discounts
- [ ] Cart integration works

### User Folder Pages Complete When:
- [ ] Users can view purchased folders
- [ ] Can access all content in folder
- [ ] Can download individual or batch
- [ ] Shows purchase history
- [ ] Navigation is intuitive

---

## 💡 Tips

1. **Copy-Paste Strategy:** Use existing Picture pages as templates to save 60-70% dev time
2. **Test as You Go:** Test each component before moving to next
3. **Reuse Components:** Card, Dialog, Button components are already perfect
4. **Consistent Styling:** Follow the existing gradient themes
5. **Error Handling:** Copy error handling patterns from picture pages
6. **Loading States:** Reuse skeleton and spinner components

---

## 📝 Notes

- All backend APIs are ready and tested
- Type definitions are complete
- Helper functions are implemented
- Only frontend pages need to be created
- Most work is copy-paste with minor adjustments
- Focus on admin pages first for content management

---

**Status:** 🟢 Core Complete | 🟡 Admin Pages Pending | 🟡 Folder Features Pending

**Next Step:** Implement VideoContentManager.tsx (Priority 1)

**Estimated Completion:** 1-2 weeks for all optional features