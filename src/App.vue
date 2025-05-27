<template>
  <div class="app-container">
    <div class="content-wrapper">
      <!-- 标题区域 -->
      <div class="header">
        <img src="/logo.svg" alt="Logo" class="logo" />
        <h1>智能客服助手</h1>
      </div>

      <!-- 导航链接 -->
      <div class="nav-links">
        <a href="https://chat.openai.com" target="_blank" class="nav-link">
          <el-icon><Link /></el-icon>
          <span>ChatGPT</span>
        </a>
        <a href="https://www.deepseek.com" target="_blank" class="nav-link">
          <el-icon><Link /></el-icon>
          <span>DeepSeek</span>
        </a>
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
                  :src="message.type === 'user' ? '/src/assets/guke.png' : '/src/assets/kefu.png'"
                >
                  <el-icon v-if="!message.type === 'user'"><User /></el-icon>
                  <el-icon v-else><Service /></el-icon>
                </el-avatar>
              </div>
              <div class="message-content">
                <div class="message-text">{{ getDisplayContent(message, index) }}</div>
                <div class="message-actions" v-if="message.type === 'assistant'">
                  <el-button size="small" :icon="CopyDocument" @click="copyMessage(message.content)" />
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
  Link,
  User,
  Service
} from '@element-plus/icons-vue'
import { sendChatMessage } from './api/chat'
import { handleError, handleSuccess } from './utils/error-handler'

const messages = ref([
  { type: 'assistant', content: '你好！我是你的 AI 助手，有什么我可以帮你的吗？' }
])
const userInput = ref('')
const messagesContainer = ref(null)
const loading = ref(false)
const currentStreamingMessage = ref('')
const error = ref(null)

// 渲染时最后一条助手消息加上光标
const getDisplayContent = (message, index) => {
  const isLast = index === messages.value.length - 1
  if (message.type === 'assistant' && isLast && loading.value) {
    return message.content + '｜' // 打字机光标
  }
  return message.content
}

const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    handleSuccess('复制成功')
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

    const stream = await sendChatMessage(userMessage)
    const reader = stream.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const sanitizedChunk = chunk.replace(/\n/g, '') // 去除所有换行符
      currentStreamingMessage.value += sanitizedChunk
      messages.value[messages.value.length - 1].content = currentStreamingMessage.value

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

.nav-links {
  padding: 15px 20px;
  display: flex;
  gap: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409EFF;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #66b1ff;
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

  .nav-links {
    padding: 10px 15px;
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

  .nav-links {
    border-bottom-color: #3d3d3d;
  }

  .nav-link {
    color: #66b1ff;
  }

  .nav-link:hover {
    color: #409EFF;
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