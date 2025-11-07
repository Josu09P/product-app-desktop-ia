import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

export function showToast(text: string, type: 'success' | 'error' = 'success') {
  Toastify({
    text,
    duration: 3000,
    gravity: 'top',
    position: 'right',
    className: `toast-glass ${type}`,
    close: true,
    stopOnFocus: true,
  }).showToast()
}
