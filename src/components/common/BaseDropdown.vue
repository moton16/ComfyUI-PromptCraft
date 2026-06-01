<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const dropdownRef = ref(null)

function selectOption(value) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="pc-dropdown" :class="{ 'pc-dropdown-disabled': disabled }">
    <button
      class="pc-dropdown-trigger"
      @click="isOpen = !isOpen"
      :disabled="disabled"
    >
      <span class="pc-dropdown-value">
        {{ options.find(o => o.value === modelValue)?.label || placeholder }}
      </span>
      <span class="pc-dropdown-arrow" :class="{ 'pc-dropdown-arrow-up': isOpen }">▾</span>
    </button>
    <Transition name="pc-dropdown">
      <div v-if="isOpen" class="pc-dropdown-menu">
        <div
          v-for="opt in options"
          :key="opt.value"
          class="pc-dropdown-item"
          :class="{ 'pc-dropdown-item-active': opt.value === modelValue }"
          @click="selectOption(opt.value)"
        >
          {{ opt.label }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pc-dropdown {
  position: relative;
  display: inline-block;
  min-width: 120px;
}

.pc-dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--comfy-input-bg, #2a2a3e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 6px;
  color: var(--pc-text, #e0e0e0);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.pc-dropdown-trigger:hover {
  border-color: var(--pc-accent, #6c5ce7);
}

.pc-dropdown-arrow {
  font-size: 10px;
  transition: transform 0.15s;
}

.pc-dropdown-arrow-up {
  transform: rotate(180deg);
}

.pc-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--pc-bg, #1e1e2e);
  border: 1px solid var(--pc-border, #444);
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.pc-dropdown-item {
  padding: 8px 10px;
  font-size: 13px;
  color: var(--pc-text, #e0e0e0);
  cursor: pointer;
  transition: background 0.1s;
}

.pc-dropdown-item:hover {
  background: var(--pc-surface, #2a2a3e);
}

.pc-dropdown-item-active {
  background: var(--pc-accent, #6c5ce7);
  color: white;
}

.pc-dropdown-enter-active,
.pc-dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.pc-dropdown-enter-from,
.pc-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
