// chat.js

import api, { API_CONFIG, API_URLS } from '../config/api'
import { handleError } from '../utils/error-handler'

export const chatApi = {
  getChatHistory: async () => {
    try {
      return await api.get(API_URLS.chat.history)
    } catch (error) {
      return handleError(error)
    }
  },
  attachments: async (file_ids) => {
    try {
      return await api.post(API_URLS.chat.attachments, { file_ids })
    } catch (error) {
      return handleError(error)
    }
  },
  streamMessage: async (message) => {  // 使用流式传输发送消息
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_URLS.chat.stream}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        throw new Error('流式响应失败')
      }

      return response.body
    } catch (error) {
      return handleError(error)
    }
  }
}
