import { createApp } from 'vue'
import App from './App.vue'
// import router from './router'
import 'ant-design-vue/dist/antd.css'
import './index.css'
import { createPinia } from 'pinia'


createApp(App).use(createPinia()).mount('#app')
