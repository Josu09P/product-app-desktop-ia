// composables/useSidebar.ts
import { ref, onMounted, watch } from 'vue'

export function useSidebar() {
  const isCollapsed = ref(false)

  const STORAGE_KEY = 'sidebar_collapsed'

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        isCollapsed.value = saved === 'true'
      }
    } catch (error) {
      console.error('Error loading sidebar state:', error)
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, isCollapsed.value.toString())
    } catch (error) {
      console.error('Error saving sidebar state:', error)
    }
  }

  function toggle() {
    isCollapsed.value = !isCollapsed.value
  }

  function setState(state: boolean) {
    isCollapsed.value = state
  }

  // Cargar estado al inicializar
  onMounted(loadState)

  // Guardar estado cuando cambie
  watch(isCollapsed, saveState)

  return {
    isCollapsed,
    toggle,
    setState
  }
}
