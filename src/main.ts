import { createApp } from 'vue'
import vueLenisPlugin from 'lenis/vue'
import './scss/app.scss'
import App from './App.vue'
import router from './router'

createApp(App).use(router).use(vueLenisPlugin).mount('#app')
