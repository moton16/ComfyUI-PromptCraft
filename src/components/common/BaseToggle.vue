<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <label class="pc-toggle-wrap" :class="{ 'pc-toggle-disabled': disabled }" @click.prevent="toggle">
    <span class="pc-toggle-label" v-if="label">{{ label }}</span>
    <span class="pc-toggle" :class="{ 'pc-toggle-on': modelValue }">
      <span class="pc-toggle-thumb" />
    </span>
  </label>
</template>

<style scoped>
.pc-toggle-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.pc-toggle-wrap.pc-toggle-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pc-toggle-label {
  font-size: 13px;
  color: var(--pc-text, #e0e0e0);
}

.pc-toggle {
  position: relative;
  width: 36px;
  height: 20px;
  background: var(--pc-surface, #2a2a3e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 10px;
  transition: all 0.2s;
}

.pc-toggle.pc-toggle-on {
  background: var(--pc-accent, #6c5ce7);
  border-color: var(--pc-accent, #6c5ce7);
}

.pc-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.pc-toggle.pc-toggle-on .pc-toggle-thumb {
  transform: translateX(16px);
}
</style>
