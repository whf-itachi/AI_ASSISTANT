import axios from 'axios'
import { handleError } from '../utils/error-handler'
import { API_CONFIG, currentConfig, API_ENDPOINTS } from '../config/api'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const { code, data, message } = response.data
    
    // 根据业务状态码处理响应
    if (code === API_CONFIG.responseCode.SUCCESS) {
      return data
    }
    
    // 处理其他状态码
    const error = new Error(message || '请求失败')
    error.code = code
    return Promise.reject(error)
  },
  error => {
    return handleError(error)
  }
)

// 聊天相关 API
export const chatApi = {
  // 发送消息
  sendMessage: async (message) => {
    try {
      const response = await api.post(API_CONFIG.endpoints.chat.send, { message })
      return response
    } catch (error) {
      return handleError(error)
    }
  },

  // 获取聊天历史
  getChatHistory: async () => {
    try {
      const response = await api.get(API_CONFIG.endpoints.chat.history)
      return response
    } catch (error) {
      return handleError(error)
    }
  },

  // 清空聊天历史
  clearChatHistory: async () => {
    try {
      const response = await api.post(API_CONFIG.endpoints.chat.clear)
      return response
    } catch (error) {
      return handleError(error)
    }
  }
}

// 从环境变量获取 API 基础地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * 发送聊天消息并获取流式响应
 * @param {string} message - 用户消息
 * @returns {Promise<ReadableStream>} - 返回流式响应
 */
export const sendChatMessage = async (message) => {
  const response = await fetch(`${currentConfig.baseURL}${API_ENDPOINTS.chat.stream}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message })
  })
  
  return response.body
} 