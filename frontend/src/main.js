import { createApp } from 'vue'
<<<<<<< HEAD
import './style.css'
=======
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

>>>>>>> 0d39961e4021288d01e36e43f21e91cce3ec4e54
import App from './App.vue'
import router from './router'

const app = createApp(App)
<<<<<<< HEAD
app.use(router)
=======

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

>>>>>>> 0d39961e4021288d01e36e43f21e91cce3ec4e54
app.mount('#app')