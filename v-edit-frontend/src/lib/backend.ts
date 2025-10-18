import axios, { AxiosError } from "axios";
import type {
  PictureFolder,
  PictureTemplate,
  VideoFolder,
  VideoContent,
  AudioFolder,
  AudioContent,
} from "./types";

// Create axios instance with base URL
const backend = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  timeout: 10000, // 10 seconds
  withCredentials: true, // This is crucial for session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
backend.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
backend.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error:", {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Clear invalid token
        localStorage.removeItem("token");
        // You can add a global handler for 401 errors here
        // For example, redirect to login page
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  },
);

export { backend };

export type Folder = {
  _id: string;
  name: string;
  parentId?: string | null;
  coverPhotoUrl?: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  basePrice?: number;
  discountPrice?: number;
  isPurchasable?: boolean;
  description?: string;
};
export type TemplateItem = {
  _id: string;
  title: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  videoUrl: string;
  qrUrl: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AdminStats = {
  totalUsers: number;
  users: User[];
  totalSales: number;
  totalPurchases: number;
};

export async function getHierarchy(folderId?: string) {
  const res = await backend.get("/content/hierarchy", { params: { folderId } });
  return res.data as {
    folders: Folder[];
    templates: TemplateItem[];
    path?: Folder[];
  };
}

export async function createFolder(name: string, parentId?: string) {
  const res = await backend.post("/content/folders", { name, parentId });
  return res.data as { folder: Folder };
}

export async function uploadTemplate(data: {
  title: string;
  basePrice: number;
  discountPrice?: number;
  videoFile: File;
  qrFile: File;
  parentId?: string;
}) {
  const formData = new FormData();

  // Append all fields to FormData
  formData.append("title", data.title);
  formData.append("basePrice", data.basePrice.toString());

  if (data.discountPrice !== undefined) {
    formData.append("discountPrice", data.discountPrice.toString());
  }

  if (data.parentId) {
    formData.append("parentId", data.parentId);
  }

  // Append files with the correct field names that the backend expects
  formData.append("video", data.videoFile, data.videoFile.name);
  formData.append("qr", data.qrFile, data.qrFile.name);

  try {
    const res = await backend.post("/content/templates", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data as { template: TemplateItem };
  } catch (error) {
    console.error(
      "Upload error details:",
      (error as any).response?.data || (error as any).message,
    );
    throw error; // Re-throw to handle in the component
  }
}

export async function getAdminStats() {
  const res = await backend.get("/admin/stats");
  return res.data as AdminStats;
}

// Picture Template API Functions
export async function getPictureHierarchy(folderId?: string) {
  const res = await backend.get("/picture-content/picture-hierarchy", {
    params: { folderId },
  });
  return res.data as {
    folders: PictureFolder[];
    templates: PictureTemplate[];
    path?: PictureFolder[];
  };
}

export async function createPictureFolder(
  name: string,
  parentId?: string,
  description?: string,
  category?: string,
) {
  const res = await backend.post("/picture-content/picture-folders", {
    name,
    parentId,
    description,
    category,
  });
  return res.data as { folder: PictureFolder };
}

export async function uploadPictureTemplate(data: {
  title: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  previewImageFile: File;
  downloadImageFile: File;
  parentId?: string;
  category?: string;
  tags?: string[];
  dimensions?: { width: number; height: number };
}) {
  const formData = new FormData();

  // Append all fields to FormData
  formData.append("title", data.title);
  formData.append("basePrice", data.basePrice.toString());

  if (data.description) {
    formData.append("description", data.description);
  }

  if (data.discountPrice !== undefined) {
    formData.append("discountPrice", data.discountPrice.toString());
  }

  if (data.parentId) {
    formData.append("parentId", data.parentId);
  }

  if (data.category) {
    formData.append("category", data.category);
  }

  if (data.tags && data.tags.length > 0) {
    formData.append("tags", data.tags.join(","));
  }

  if (data.dimensions) {
    formData.append("dimensions", JSON.stringify(data.dimensions));
  }

  // Append files with the correct field names that the backend expects
  formData.append(
    "previewImage",
    data.previewImageFile,
    data.previewImageFile.name,
  );
  formData.append(
    "downloadImage",
    data.downloadImageFile,
    data.downloadImageFile.name,
  );

  try {
    const res = await backend.post(
      "/picture-content/picture-templates",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data as { template: PictureTemplate };
  } catch (error) {
    console.error(
      "Picture upload error details:",
      (error as any).response?.data || (error as any).message,
    );
    throw error;
  }
}

export async function getPictureTemplate(id: string) {
  const res = await backend.get(`/picture-content/picture-templates/${id}`);
  return res.data as { template: PictureTemplate };
}

export async function updatePictureFolder(
  id: string,
  data: {
    name?: string;
    parentId?: string;
    description?: string;
    category?: string;
    basePrice?: number;
    discountPrice?: number;
    isPurchasable?: boolean;
    thumbnailUrl?: string;
    previewImageUrl?: string;
    coverPhotoUrl?: string;
  },
) {
  const res = await backend.put(`/picture-content/picture-folders/${id}`, data);
  return res.data as { folder: PictureFolder };
}

export async function updatePictureTemplate(
  id: string,
  data: {
    title?: string;
    description?: string;
    basePrice?: number;
    discountPrice?: number;
    folderId?: string;
    category?: string;
    tags?: string[];
    dimensions?: { width: number; height: number };
    previewImageFile?: File;
    downloadImageFile?: File;
  },
) {
  const formData = new FormData();

  // Append fields
  Object.entries(data).forEach(([key, value]) => {
    if (
      value !== undefined &&
      key !== "previewImageFile" &&
      key !== "downloadImageFile"
    ) {
      if (key === "tags" && Array.isArray(value)) {
        formData.append(key, value.join(","));
      } else if (key === "dimensions" && typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  // Append files if provided
  if (data.previewImageFile) {
    formData.append(
      "previewImage",
      data.previewImageFile,
      data.previewImageFile.name,
    );
  }

  if (data.downloadImageFile) {
    formData.append(
      "downloadImage",
      data.downloadImageFile,
      data.downloadImageFile.name,
    );
  }

  try {
    const res = await backend.put(
      `/picture-content/picture-templates/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data as { template: PictureTemplate };
  } catch (error) {
    console.error(
      "Picture update error details:",
      (error as any).response?.data || (error as any).message,
    );
    throw error;
  }
}

export async function deletePictureFolder(id: string) {
  const res = await backend.delete(`/picture-content/picture-folders/${id}`);
  return res.data as { message: string };
}

export async function deletePictureTemplate(id: string) {
  const res = await backend.delete(`/picture-content/picture-templates/${id}`);
  return res.data as { message: string };
}

// Template Management
export async function updateTemplate(
  id: string,
  data: {
    title?: string;
    description?: string;
    basePrice?: number;
    discountPrice?: number;
    folderId?: string | null;
    videoFile?: File;
    qrFile?: File;
  },
) {
  const formData = new FormData();

  if (data.title) formData.append("title", data.title);
  if (data.description !== undefined)
    formData.append("description", data.description);
  if (data.basePrice) formData.append("basePrice", data.basePrice.toString());
  if (data.discountPrice)
    formData.append("discountPrice", data.discountPrice.toString());
  if (data.folderId !== undefined)
    formData.append("folderId", data.folderId || "");
  if (data.videoFile) formData.append("video", data.videoFile);
  if (data.qrFile) formData.append("qr", data.qrFile);

  const res = await backend.put(`/content/templates/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}

export async function deleteTemplate(id: string) {
  const res = await backend.delete(`/content/templates/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}

export async function moveTemplate(id: string, folderId: string | null) {
  const res = await backend.patch(
    `/content/templates/${id}/move`,
    { folderId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
  return res.data;
}

// Folder Management
export async function updateFolder(
  id: string,
  data: {
    name?: string;
    parentId?: string | null;
  },
) {
  const res = await backend.put(`/content/folders/${id}`, data);
  return res.data;
}

export async function deleteFolder(id: string) {
  const res = await backend.delete(`/content/folders/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}

export async function moveFolder(id: string, parentId: string | null) {
  const res = await backend.patch(
    `/content/folders/${id}/move`,
    { parentId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
  return res.data;
}

// Cover Photo Upload Functions
export async function uploadFolderCoverPhoto(id: string, coverPhotoFile: File) {
  const formData = new FormData();
  formData.append("coverPhoto", coverPhotoFile);

  const res = await backend.post(
    `/content/folders/${id}/cover-photo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
}

export async function uploadPictureFolderCoverPhoto(
  id: string,
  coverPhotoFile: File,
) {
  const formData = new FormData();
  formData.append("coverPhoto", coverPhotoFile);

  const res = await backend.post(
    `/picture-content/picture-folders/${id}/cover-photo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
}

// Video Content API Functions
export async function getVideoHierarchy(folderId?: string) {
  const res = await backend.get("/video-content/video-hierarchy", {
    params: { folderId },
  });
  return res.data as {
    folders: VideoFolder[];
    videos: VideoContent[];
    path?: VideoFolder[];
  };
}

export async function createVideoFolder(
  name: string,
  parentId?: string,
  description?: string,
  category?: string,
) {
  const res = await backend.post("/video-content/video-folders", {
    name,
    parentId,
    description,
    category,
  });
  return res.data as { folder: VideoFolder };
}

export async function uploadVideoContent(data: {
  title: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  videoFile: File;
  thumbnailFile?: File;
  parentId?: string;
  category?: string;
  tags?: string[];
}) {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("basePrice", data.basePrice.toString());

  if (data.description) formData.append("description", data.description);
  if (data.discountPrice !== undefined)
    formData.append("discountPrice", data.discountPrice.toString());
  if (data.parentId) formData.append("parentId", data.parentId);
  if (data.category) formData.append("category", data.category);
  if (data.tags && data.tags.length > 0)
    formData.append("tags", data.tags.join(","));

  formData.append("video", data.videoFile, data.videoFile.name);
  if (data.thumbnailFile)
    formData.append("thumbnail", data.thumbnailFile, data.thumbnailFile.name);

  try {
    const res = await backend.post("/video-content/video-content", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes for video upload
    });
    return res.data as { video: VideoContent };
  } catch (error) {
    console.error(
      "Video upload error:",
      (error as any).response?.data || (error as any).message,
    );
    throw error;
  }
}

export async function getVideoContent(id: string) {
  const res = await backend.get(`/video-content/video-content/${id}`);
  return res.data as { video: VideoContent };
}

export async function updateVideoFolder(
  id: string,
  data: {
    name?: string;
    parentId?: string;
    description?: string;
    category?: string;
    basePrice?: number;
    discountPrice?: number;
    isPurchasable?: boolean;
    coverPhotoUrl?: string;
  },
) {
  const res = await backend.put(`/video-content/video-folders/${id}`, data);
  return res.data as { folder: VideoFolder };
}

export async function updateVideoContent(
  id: string,
  data: {
    title?: string;
    description?: string;
    basePrice?: number;
    discountPrice?: number;
    folderId?: string;
    category?: string;
    tags?: string[];
    videoFile?: File;
    thumbnailFile?: File;
  },
) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && key !== "videoFile" && key !== "thumbnailFile") {
      if (key === "tags" && Array.isArray(value)) {
        formData.append(key, value.join(","));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  if (data.videoFile)
    formData.append("video", data.videoFile, data.videoFile.name);
  if (data.thumbnailFile)
    formData.append("thumbnail", data.thumbnailFile, data.thumbnailFile.name);

  try {
    const res = await backend.put(
      `/video-content/video-content/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000,
      },
    );
    return res.data as { video: VideoContent };
  } catch (error) {
    console.error(
      "Video update error:",
      (error as any).response?.data || (error as any).message,
    );
    throw error;
  }
}

export async function deleteVideoFolder(id: string) {
  const res = await backend.delete(`/video-content/video-folders/${id}`);
  return res.data as { message: string };
}

export async function deleteVideoContent(id: string) {
  const res = await backend.delete(`/video-content/video-content/${id}`);
  return res.data as { message: string };
}

export async function uploadVideoFolderCoverPhoto(
  id: string,
  coverPhotoFile: File,
) {
  const formData = new FormData();
  formData.append("coverPhoto", coverPhotoFile);

  const res = await backend.post(
    `/video-content/video-folders/${id}/cover-photo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
}

// Audio Content API Functions
export async function getAudioHierarchy(folderId?: string) {
  const res = await backend.get("/audio-content/audio-hierarchy", {
    params: { folderId },
  });
  return res.data as {
    folders: AudioFolder[];
    audio: AudioContent[];
    path?: AudioFolder[];
  };
}

export async function createAudioFolder(
  name: string,
  parentId?: string,
  description?: string,
  category?: string,
) {
  const res = await backend.post("/audio-content/audio-folders", {
    name,
    parentId,
    description,
    category,
  });
  return res.data as { folder: AudioFolder };
}

export async function uploadAudioContent(data: {
  title: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  audioFile: File;
  thumbnailFile?: File;
  parentId?: string;
  category?: string;
  artist?: string;
  album?: string;
  tags?: string[];
}) {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("basePrice", data.basePrice.toString());

  if (data.description) formData.append("description", data.description);
  if (data.discountPrice !== undefined)
    formData.append("discountPrice", data.discountPrice.toString());
  if (data.parentId) formData.append("parentId", data.parentId);
  if (data.category) formData.append("category", data.category);
  if (data.artist) formData.append("artist", data.artist);
  if (data.album) formData.append("album", data.album);
  if (data.tags && data.tags.length > 0)
    formData.append("tags", data.tags.join(","));

  formData.append("audio", data.audioFile, data.audioFile.name);
  if (data.thumbnailFile)
    formData.append("thumbnail", data.thumbnailFile, data.thumbnailFile.name);

  try {
    const res = await backend.post("/audio-content/audio-content", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minutes for audio upload
    });
    return res.data as { audio: AudioContent };
  } catch (error) {
    console.error(
      "Audio upload error:",
      (error as any).response?.data || (error as any).message,
    );
    throw error;
  }
}

export async function getAudioContent(id: string) {
  const res = await backend.get(`/audio-content/audio-content/${id}`);
  return res.data as { audio: AudioContent };
}

export async function updateAudioFolder(
  id: string,
  data: {
    name?: string;
    parentId?: string;
    description?: string;
    category?: string;
    basePrice?: number;
    discountPrice?: number;
    isPurchasable?: boolean;
    coverPhotoUrl?: string;
  },
) {
  const res = await backend.put(`/audio-content/audio-folders/${id}`, data);
  return res.data as { folder: AudioFolder };
}

export async function updateAudioContent(
  id: string,
  data: {
    title?: string;
    description?: string;
    basePrice?: number;
    discountPrice?: number;
    folderId?: string;
    category?: string;
    artist?: string;
    album?: string;
    tags?: string[];
    audioFile?: File;
    thumbnailFile?: File;
  },
) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && key !== "audioFile" && key !== "thumbnailFile") {
      if (key === "tags" && Array.isArray(value)) {
        formData.append(key, value.join(","));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  if (data.audioFile)
    formData.append("audio", data.audioFile, data.audioFile.name);
  if (data.thumbnailFile)
    formData.append("thumbnail", data.thumbnailFile, data.thumbnailFile.name);

  try {
    const res = await backend.put(
      `/audio-content/audio-content/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
      },
    );
    return res.data as { audio: AudioContent };
  } catch (error) {
    console.error(
      "Audio update error:",
      (error as any).response?.data || (error as any).message,
    );
    throw error;
  }
}

export async function deleteAudioFolder(id: string) {
  const res = await backend.delete(`/audio-content/audio-folders/${id}`);
  return res.data as { message: string };
}

export async function deleteAudioContent(id: string) {
  const res = await backend.delete(`/audio-content/audio-content/${id}`);
  return res.data as { message: string };
}

export async function uploadAudioFolderCoverPhoto(
  id: string,
  coverPhotoFile: File,
) {
  const formData = new FormData();
  formData.append("coverPhoto", coverPhotoFile);

  const res = await backend.post(
    `/audio-content/audio-folders/${id}/cover-photo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
}
