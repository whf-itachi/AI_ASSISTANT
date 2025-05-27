import { ElMessage } from 'element-plus'
import { API_CONFIG } from '../config/api'

export const handleError = (error) => {
  console.error('API Error:', error)

  // 获取错误信息
  const message = error.response?.data?.message || error.message || '请求失败'
  const code = error.code || error.response?.status

  // 根据错误码处理
  switch (code) {
    case API_CONFIG.responseCode.UNAUTHORIZED:
      // 未授权，清除 token 并跳转到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
      break
    case API_CONFIG.responseCode.FORBIDDEN:
      ElMessage.error('没有权限访问该资源')
      break
    case API_CONFIG.responseCode.NOT_FOUND:
      ElMessage.error('请求的资源不存在')
      break
    case API_CONFIG.responseCode.SERVER_ERROR:
      ElMessage.error('服务器错误，请稍后重试')
      break
    default:
      ElMessage.error(message)
  }

  return Promise.reject(error)
}

export const handleSuccess = (message = '操作成功') => {
  ElMessage.success(message)
} 