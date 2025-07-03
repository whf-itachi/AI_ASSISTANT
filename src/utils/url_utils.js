/**
 * 拼接 URL 路径，自动处理多余或缺失的路径分隔符
 * @param  {...string} parts 多个路径片段
 * @returns {string} 拼接后的路径
 */
export function joinUrlParts(...parts) {
  return parts
    .map((part, idx) => {
      if (typeof part !== 'string') return ''
      // 首段保留头部，尾段保留尾部，其余去头尾斜杠
      if (idx === 0) return part.replace(/\/+$/, '')
      if (idx === parts.length - 1) return part.replace(/^\/+/, '')
      return part.replace(/^\/+|\/+$/g, '')
    })
    .filter(Boolean)
    .join('/')
}

/**
 * 去除路径前缀
 * @param {string} path 原始路径
 * @param {string} prefix 要去除的前缀
 * @returns {string} 去除前缀后的路径
 */
export function stripPrefix(path, prefix) {
  if (typeof path !== 'string' || typeof prefix !== 'string') return path
  if (path.startsWith(prefix)) {
    return path.slice(prefix.length)
  }
  return path
}
