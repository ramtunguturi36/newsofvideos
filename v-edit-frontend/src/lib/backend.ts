import axios, { AxiosError } from 'axios';

// Create axios instance with base URL
const backend = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  timeout: 10000, // 10 seconds
  withCredentials: true, // This is crucial for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
backend.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
backend.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('token');
        // You can add a global handler for 401 errors here
        // For example, redirect to login page
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export { backend };

export type Folder = { _id: string; name: string; parentId?: string | null }
export type TemplateItem = {
  _id: string
  title: string
  description?: string
  basePrice: number
  discountPrice?: number
  videoUrl: string
  qrUrl: string
}

export type User = {
  _id: string
  name: string
  email: string
  createdAt: string
}

export type AdminStats = {
  totalUsers: number
  users: User[]
  totalSales: number
  totalPurchases: number
}

export async function getHierarchy(folderId?: string) {
  const res = await backend.get('/content/hierarchy', { params: { folderId } })
  return res.data as { folders: Folder[]; templates: TemplateItem[]; path?: Folder[] }
}

export async function createFolder(name: string, parentId?: string) {
  const res = await backend.post('/content/folders', { name, parentId })
  return res.data as { folder: Folder }
}

export async function uploadTemplate(data: {
  title: string
  basePrice: number
  discountPrice?: number
  videoFile: File
  qrFile: File
  parentId?: string
}) {
  const formData = new FormData()
  
  // Append all fields to FormData
  formData.append('title', data.title)
  formData.append('basePrice', data.basePrice.toString())
  
  if (data.discountPrice !== undefined) {
    formData.append('discountPrice', data.discountPrice.toString())
  }
  
  if (data.parentId) {
    formData.append('parentId', data.parentId)
  }
  
  // Append files with the correct field names that the backend expects
  formData.append('video', data.videoFile, data.videoFile.name)
  formData.append('qr', data.qrFile, data.qrFile.name)
  
  try {
    const res = await backend.post('/content/templates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token if needed
      },
    })
    return res.data as { template: TemplateItem }
  } catch (error) {
    console.error('Upload error details:', (error as any).response?.data || (error as any).message)
    throw error // Re-throw to handle in the component
  }
}

export async function getAdminStats() {
  const res = await backend.get('/admin/stats')
  return res.data as AdminStats
}

// Template Management
export async function updateTemplate(id: string, data: {
  title?: string
  description?: string
  basePrice?: number
  discountPrice?: number
  folderId?: string | null
  videoFile?: File
  qrFile?: File
}) {
  const formData = new FormData()
  
  if (data.title) formData.append('title', data.title)
  if (data.description !== undefined) formData.append('description', data.description)
  if (data.basePrice) formData.append('basePrice', data.basePrice.toString())
  if (data.discountPrice) formData.append('discountPrice', data.discountPrice.toString())
  if (data.folderId !== undefined) formData.append('folderId', data.folderId || '')
  if (data.videoFile) formData.append('video', data.videoFile)
  if (data.qrFile) formData.append('qr', data.qrFile)
  
  const res = await backend.put(`/content/templates/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  return res.data
}

export async function deleteTemplate(id: string) {
  const res = await backend.delete(`/content/templates/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  return res.data
}

export async function moveTemplate(id: string, folderId: string | null) {
  const res = await backend.patch(`/content/templates/${id}/move`, { folderId }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  return res.data
}

// Folder Management
export async function updateFolder(id: string, data: {
  name?: string
  parentId?: string | null
}) {
  const res = await backend.put(`/content/folders/${id}`, data, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  return res.data
}

export async function deleteFolder(id: string) {
  const res = await backend.delete(`/content/folders/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  return res.data
}

export async function moveFolder(id: string, parentId: string | null) {
  const res = await backend.patch(`/content/folders/${id}/move`, { parentId }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  return res.data
}