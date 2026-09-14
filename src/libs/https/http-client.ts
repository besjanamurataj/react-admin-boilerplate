import axios, { AxiosError } from 'axios'

const instance = axios.create({
  // ' '''
  // baseURL: 'http://192.168.10.31:3000',
  baseURL: 'http://localhost:3000',
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
})

instance.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('jwtToken')

    if (token) {
      config.headers = config.headers ?? {}
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  },
)

instance.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const status = error.response?.status

    if (status === 401 || status === 403) {
      console.warn('Unauthorized or token expired')

      localStorage.removeItem('jwtToken')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default instance

export class HttpClient {
  static async get<T>(url: string, params?: any): Promise<T> {
    const response = await instance.get<T>(url, { params })
    return response.data
  }

  static async post<T>(url: string, data: any, options?: any): Promise<T> {
    const response = await instance.post<T>(url, data, options)
    return response.data
  }

  static async put<T>(url: string, data: any, options?: any): Promise<T> {
    const response = await instance.put<T>(url, data, options)
    return response.data
  }

  static async delete<T>(url: string): Promise<T> {
    const response = await instance.delete<T>(url)
    return response.data
  }
}
