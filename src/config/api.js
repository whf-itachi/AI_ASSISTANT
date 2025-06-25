// api.js

import axios from 'axios'
import { handleError } from '../utils/error-handler'


// 所有 API 路径统一管理
export const API_URLS = {
  chat: {
    stream: '/AI/assistant/chat/stream',  // 流式会话
    feedback: '/AI/assistant/chat/feedback',  // 反馈问题
    attachments: '/AI/assistant/chat/attachments'  // 根据文档id列表查询相关附件信息
  },
  attachment: {
    attachmentPreview: '/AI/assistant/attachment/preview/{attachmentId}',
    logout: '/api/user/logout',
    profile: '/api/user/profile'
  }
}


// API 配置（按环境自动切换）
const isProd = import.meta.env.MODE === 'production'

export const API_CONFIG = {
  baseURL: isProd ? 'https://haitch.tech' : 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  responseCode: {
    SUCCESS: 200,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  }
}

// 创建 Axios 实例
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers
})

// 请求拦截器：附加 token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：处理业务响应码
api.interceptors.response.use(
  response => {
    const { code, data, message } = response.data
    if (code === API_CONFIG.responseCode.SUCCESS) {
      return data
    }
    const error = new Error(message || '请求失败')
    error.code = code
    return Promise.reject(error)
  },
  error => handleError(error)
)

export default api
