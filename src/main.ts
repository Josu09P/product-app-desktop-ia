import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Importacion de librerias para estilos, iconos y responsividad de bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'toastify-js/src/toastify.css' // TOASTIFY CSS

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
