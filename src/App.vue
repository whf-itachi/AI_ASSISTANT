<template>
  <div class="app-container">
    <div class="content-wrapper">
      <!-- 标题区域 -->
      <div class="header">
        <img src="/favicon.ico" alt="Logo" class="logo" />
        <h1>智能客服助手</h1>
        <el-dropdown class="more-dropdown" trigger="click">
          <el-button type="primary" link>
            更多
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="navigateTo('/chat')">
                <el-icon><ChatDotRound /></el-icon>
                公司介绍
              </el-dropdown-item>
              <el-dropdown-item @click="navigateTo('/knowledge')">
                <el-icon><Collection /></el-icon>
                产品介绍
              </el-dropdown-item>
              <el-dropdown-item @click="navigateTo('/settings')">
                <el-icon><Cellphone /></el-icon>
                联系我们
              </el-dropdown-item>
              <el-dropdown-item @click="goToTicketManagement">
                <el-icon><Tickets /></el-icon>
                工单管理
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 聊天区域 -->
      <div class="chat-container">
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="loading && messages.length === 0" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <template v-else>
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="['message', message.type]"
            >
              <div class="message-avatar">
                <el-avatar 
                  :size="40"
                  :src="message.type === 'user' ? `${getBaseUrl()}/assets/guke.png` : `${getBaseUrl()}/assets/kefu.png`"
                >
                  <el-icon v-if="!message.type === 'user'"><User /></el-icon>
                  <el-icon v-else><Service /></el-icon>
                </el-avatar>
              </div>
              <div class="message-content">
                <div class="message-text" v-html="getDisplayContent(message, index)"></div>
                <div class="message-actions" v-if="message.type === 'assistant'">
                  <el-button size="small" :icon="CopyDocument" @click="copyMessage(message.content)" />
                </div>
                <div class="message-actions" v-if="message.type === 'user'">
                  <el-button size="small" :icon="Connection" @click="feedBack(message.content)" />
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="chat-input-container">
          <div class="input-wrapper">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="3"
              :maxlength="2000"
              show-word-limit
              resize="none"
              placeholder="输入消息，按 Ctrl + Enter 发送..."
              @keyup.enter.ctrl="sendMessage"
            />
          </div>
          <div class="input-footer">
            <el-button 
              type="primary" 
              @click="sendMessage" 
              :icon="Promotion"
              :loading="loading"
              :disabled="!userInput.trim() || loading"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { 
  Promotion, 
  CopyDocument, 
  User,
  Service,
  ArrowDown,
  ChatDotRound,
  Collection,
  Tickets,
  Cellphone,
  Connection
} from '@element-plus/icons-vue'
import { chatApi  } from './api/chat'
import { handleError, handleSuccess } from './utils/error-handler'

// 获取基础路径
const getBaseUrl = () => {
  return import.meta.env.PROD ? '/assistant' : ''
}

const messages = ref([
  { type: 'assistant', content: '你好！我是你的 AI 助手，有什么我可以帮你的吗？' }
])
const userInput = ref('')
const messagesContainer = ref(null)
const loading = ref(false)
const currentStreamingMessage = ref('')
const error = ref(null)
const attachments = ref([])  // 附件列表

const navigateTo = (path) => {
  // 这里可以添加路由跳转逻辑
  console.log('Navigating to:', path)
}

const goToTicketManagement = () => {
  window.open('https://haitch.tech/mobile/', '_blank');
}

// 渲染时最后一条助手消息加上光标
const getDisplayContent = (message, index) => {
  const isLast = index === messages.value.length - 1
  let content = message.content
  
  // 检测并转换链接
  const urlRegex = /(https?:\/\/[^\s]+)/g
  content = content.replace(urlRegex, url => {
    return `<a href="${url}" target="_blank" class="message-link">${url}</a>`
  })
  
  if (message.type === 'assistant' && isLast && loading.value) {
    return content + '｜' // 打字机光标
  }
  return content
}

const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    handleSuccess('复制成功')
  } catch (error) {
    handleError(error)
  }
}
const feedBack = async (content) => {
  try {
    const res = await chatApi.feedBackQuestion(content)
    console.log('Feedback response:', res)
    handleSuccess('反馈成功')
  } catch (error) {
    handleError(error)
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return

  const userMessage = userInput.value
  userInput.value = ''
  loading.value = true
  currentStreamingMessage.value = ''
  error.value = null

  try {
    messages.value.push({ type: 'user', content: userMessage })
    messages.value.push({ type: 'assistant', content: '' })

    await nextTick()
    scrollToBottom()
    const stream = await chatApi.streamMessage(userMessage)
    // const stream = await sendChatMessage(userMessage)
    const reader = stream.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })

      try {
        const data = JSON.parse(chunk)
        if (data.type === 'text') {
          currentStreamingMessage.value += data.content
          messages.value[messages.value.length - 1].content = currentStreamingMessage.value
        } else if (data.type === 'attachments' && Array.isArray(data.content) && data.content.length > 0) {  // 非空附件数组进行附件处理逻辑
          const res = await chatApi.attachments(data.content)

          if (res.ok) {
            const attachmentInfo = await res.json()
            attachments.value = attachmentInfo
            messages.value.push({
              type: 'attachment',
              content: attachmentInfo
            })
          }
        }
      } catch (e) {
        console.warn('JSON 解析失败:', chunk)
      }

      await nextTick()
      requestAnimationFrame(() => scrollToBottom())
    }

    handleSuccess('消息发送成功')
  } catch (err) {
    error.value = err.message || '发送消息失败'
    handleError(err)
    messages.value.pop()
  } finally {
    loading.value = false
    currentStreamingMessage.value = ''
    await nextTick()
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.message-text {
  white-space: pre-wrap; /* 保留 \n，不自动换行 */
  word-break: break-word;
  font-family: monospace;
  line-height: 1.6;
  color: #333;
}

.cursor {
  display: inline-block;
  width: 1px;
  background: #333;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% {
    background-color: transparent;
  }
}

.app-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: #f5f7fa;
  padding: 20px;
}

.content-wrapper {
  width: 100%;
  max-width: 66.666%;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px);
}

.header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e5e5e5;
  position: relative;
}

.logo {
  width: 32px;
  height: 32px;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
}

.more-dropdown {
  margin-left: auto;
}

.more-dropdown :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

.more-dropdown :deep(.el-icon) {
  margin-right: 4px;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-avatar :deep(.el-avatar) {
  background-color: transparent !important;
}

.message-content {
  flex: 1;
  min-width: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message.user .message-content {
  text-align: right;
}

.message-text {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 15px;
  color: #333;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  display: inline-block;
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #f5f7fa;
}

.message-text :deep(.message-link) {
  color: #409EFF;
  text-decoration: none;
  word-break: break-all;
}

.message-text :deep(.message-link:hover) {
  text-decoration: underline;
}

.message.user .message-text {
  background-color: #409EFF;
  color: white;
}

.message.assistant .message-text {
  background-color: #f5f7fa;
  color: #333;
}

.message-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.message.user .message-actions {
  justify-content: flex-end;
}

.message.assistant .message-actions {
  justify-content: flex-start;
}

.chat-input-container {
  border-top: 1px solid #e5e5e5;
  padding: 20px;
}

.input-wrapper {
  margin-bottom: 10px;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-tips {
  display: flex;
  gap: 10px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-container {
    padding: 0;
  }

  .content-wrapper {
    max-width: 100%;
    height: 100vh;
    border-radius: 0;
    box-shadow: none;
  }

  .header {
    padding: 15px;
  }

  .chat-messages {
    padding: 15px;
  }

  .message {
    gap: 10px;
  }

  .message-text :deep(pre) {
    padding: 10px;
  }

  .chat-input-container {
    padding: 15px;
  }
  
  .input-wrapper {
    margin-bottom: 10px;
  }
  
  .input-footer {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .input-tips {
    justify-content: center;
  }
}

/* 电脑端样式 */
@media (min-width: 769px) {
  .input-footer {
    justify-content: flex-end;
  }

  .input-tips {
    display: none;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .app-container {
    background-color: #1a1a1a;
  }

  .content-wrapper {
    background-color: #2d2d2d;
  }

  .header {
    border-bottom-color: #3d3d3d;
  }

  .header h1 {
    color: #ffffff;
  }

  .more-dropdown :deep(.el-button) {
    color: #409EFF;
  }
  
  .more-dropdown :deep(.el-button:hover) {
    color: #66b1ff;
  }

  .chat-input-container {
    border-top-color: #3d3d3d;
  }

  .message-text :deep(pre) {
    background-color: #1a1a1a;
  }
}

/* 添加打字机效果的样式 */
.message.assistant .message-text {
  display: inline-block;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 打字机效果的光标 */
.message.assistant .message-text::after {
  content: '|';
  display: inline-block;
  animation: blink 1s infinite;
  color: #409EFF;
  font-weight: bold;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style> 