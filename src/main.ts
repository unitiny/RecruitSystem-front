import './assets/main.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia} from "pinia"
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate  from 'pinia-plugin-persistedstate'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(router)
app.mount('#app')
