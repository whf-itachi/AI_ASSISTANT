<!-- components/PreviewDialog.vue -->
<template>
  <el-dialog v-model="visible" width="80%" top="5vh" :title="fileName" :destroy-on-close="true">
    <div v-if="fileType.startsWith('image/')" class="preview-content">
      <img :src="previewUrl" class="preview-image" />
    </div>
    <div v-else-if="fileType.startsWith('video/')" class="preview-content">
      <video controls :src="previewUrl" class="preview-video" />
    </div>
    <div v-else>不支持的预览类型</div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  fileName: String,
  fileType: String,
  previewUrl: String
})
const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => (visible.value = val))
watch(visible, (val) => emit('update:modelValue', val))
</script>

<style scoped>
.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
}
.preview-image, .preview-video {
  max-width: 100%;
  max-height: 70vh;
}
</style>
