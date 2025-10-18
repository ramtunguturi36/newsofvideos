export interface Folder {
  _id: string;
  name: string;
  parentId: string | null;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  isPurchasable: boolean;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  coverPhotoUrl?: string;
  totalTemplates: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sampleTemplates?: TemplateItem[];
}

export interface TemplateItem {
  _id: string;
  title: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  videoUrl: string;
  qrUrl: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  type:
    | "template"
    | "folder"
    | "picture-template"
    | "picture-folder"
    | "video-content"
    | "video-folder"
    | "audio-content"
    | "audio-folder";
  title: string;
  price: number;
  data: any;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  expiryDate?: string;
  isActive: boolean;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  coupon: {
    code: string;
    discountType: "percentage" | "fixed";
    value: number;
    description?: string;
  };
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export interface UserAccess {
  _id: string;
  userId: string;
  accessType: "template" | "folder";
  templateId?: string;
  folderId?: string;
  purchaseId: string;
  grantedAt: string;
  includedTemplates?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UserAccess {
  hasAccess: boolean;
  purchaseDate: string | null;
  templates: TemplateItem[];
}

export interface FolderPreview {
  _id: string;
  name: string;
  description?: string;
  basePrice?: number;
  discountPrice?: number;
  isPurchasable: boolean;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  templateCount: number;
  templates: TemplateItem[];
}

// Picture Template Types
export interface PictureFolder {
  _id: string;
  name: string;
  parentId: string | null;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  isPurchasable: boolean;
  thumbnailUrl?: string;
  previewImageUrl?: string;
  coverPhotoUrl?: string;
  totalPictures: number;
  createdBy: string;
  category:
    | "photography"
    | "graphics"
    | "illustrations"
    | "templates"
    | "other";
  createdAt: string;
  updatedAt: string;
  samplePictures?: PictureTemplate[];
}

export interface PictureTemplate {
  _id: string;
  title: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  previewImageUrl: string;
  downloadImageUrl: string;
  folderId: string | null;
  category:
    | "photography"
    | "graphics"
    | "illustrations"
    | "templates"
    | "other";
  tags: string[];
  dimensions?: {
    width: number;
    height: number;
  };
  fileSize?: number;
  format: "jpg" | "jpeg" | "png" | "gif" | "webp";
  createdAt: string;
  updatedAt: string;
}

export interface PictureFolderPreview {
  _id: string;
  name: string;
  description?: string;
  basePrice?: number;
  discountPrice?: number;
  isPurchasable: boolean;
  thumbnailUrl?: string;
  previewImageUrl?: string;
  pictureCount: number;
  pictures: PictureTemplate[];
}

// Video Content Types
export interface VideoFolder {
  _id: string;
  name: string;
  parentId: string | null;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  isPurchasable: boolean;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  coverPhotoUrl?: string;
  totalVideos: number;
  createdBy: string;
  category:
    | "animations"
    | "tutorials"
    | "music-videos"
    | "commercials"
    | "documentaries"
    | "other";
  createdAt: string;
  updatedAt: string;
  sampleVideos?: VideoContent[];
}

export interface VideoContent {
  _id: string;
  title: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  previewVideoUrl: string;
  downloadVideoUrl: string;
  thumbnailUrl?: string;
  folderId: string | null;
  category:
    | "animations"
    | "tutorials"
    | "music-videos"
    | "commercials"
    | "documentaries"
    | "other";
  tags: string[];
  duration?: number;
  resolution?: {
    width: number;
    height: number;
  };
  fileSize?: number;
  format: "mp4" | "mov" | "avi" | "webm" | "mkv";
  fps?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoFolderPreview {
  _id: string;
  name: string;
  description?: string;
  basePrice?: number;
  discountPrice?: number;
  isPurchasable: boolean;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  videoCount: number;
  videos: VideoContent[];
}

// Audio Content Types
export interface AudioFolder {
  _id: string;
  name: string;
  parentId: string | null;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  isPurchasable: boolean;
  thumbnailUrl?: string;
  previewAudioUrl?: string;
  coverPhotoUrl?: string;
  totalAudio: number;
  createdBy: string;
  category:
    | "audiobooks"
    | "music"
    | "podcasts"
    | "sound-effects"
    | "ambient"
    | "other";
  createdAt: string;
  updatedAt: string;
  sampleAudio?: AudioContent[];
}

export interface AudioContent {
  _id: string;
  title: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  previewAudioUrl: string;
  downloadAudioUrl: string;
  thumbnailUrl?: string;
  folderId: string | null;
  category:
    | "audiobooks"
    | "music"
    | "podcasts"
    | "sound-effects"
    | "ambient"
    | "other";
  tags: string[];
  duration?: number;
  fileSize?: number;
  format: "mp3" | "wav" | "aac" | "flac" | "ogg" | "m4a";
  bitrate?: number;
  sampleRate?: number;
  artist?: string;
  album?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudioFolderPreview {
  _id: string;
  name: string;
  description?: string;
  basePrice?: number;
  discountPrice?: number;
  isPurchasable: boolean;
  thumbnailUrl?: string;
  previewAudioUrl?: string;
  audioCount: number;
  audio: AudioContent[];
}
