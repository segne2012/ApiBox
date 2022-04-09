import { defineConfig } from 'vite';
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.dark.css'

createApp(App)
.use(createPinia())
.use(antd)
.use(router)
.mount('#app')
