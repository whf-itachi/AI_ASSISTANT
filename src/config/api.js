// API 配置
export const API_CONFIG = {
  // 开发环境
  development: {
    baseURL: 'http://127.0.0.1:8000'
  },
  // 生产环境
  production: {
    baseURL: 'https://haitch.tech'
  }
}

// 根据当前环境获取配置
const env = import.meta.env.MODE || 'development'
export const currentConfig = API_CONFIG[env]

// API 端点
export const API_ENDPOINTS = {
  chat: {
    stream: '/AI/assistant/chat/stream'
  }
}

// API 路径
export const API_PATHS = {
  chat: {
    send: '/api/chat/send',
    history: '/api/chat/history',
    clear: '/api/chat/clear'
  },
  user: {
    login: '/api/user/login',
    logout: '/api/user/logout',
    profile: '/api/user/profile'
  }
}

// 响应码
export const API_RESPONSE_CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
} 