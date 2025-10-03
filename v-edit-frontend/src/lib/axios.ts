import axios from 'axios'

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function loginRequest(email: string, password: string) {
  const res = await api.post('/login', { email, password })
  return res.data as { token: string; role: 'admin' | 'user' }
}

export async function registerRequest(
  name: string,
  email: string,
  password: string
) {
  const res = await api.post('/register', { name, email, password })
  return res.data as { success: boolean }
}

