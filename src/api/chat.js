// chat.js

import api, { API_CONFIG, API_URLS } from '../config/api'
import { handleError } from '../utils/error-handler'

export const chatApi = {
  feedBackQuestion: async (question) => {
    try {
      return await api.post(API_URLS.chat.feedback, {question})
    } catch (error) {
      return handleError(error)
    }
  },
  attachments: async (data) => {
    try {
      const { file_ids, size } = data
      return await api.post(API_URLS.chat.attachments, { file_ids, size })
    } catch (error) {
      console.error('获取附件失败:', error)
      return handleError(error)
    }
  },
  attachmentPreview: async (attachment_id) => {
    try {
      const url = `${API_CONFIG.baseURL}${API_URLS.attachment.attachmentPreview.replace('{attachmentId}', attachment_id)}`
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`预览请求失败，状态码: ${res.status}`)
      }
      return await res.blob()
    } catch (error) {
      console.error('预览请求出错:', error)
      throw error
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
