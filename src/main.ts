import './assets/main.css'
import "@mdi/font/css/materialdesignicons.css";
import 'vue-toastification/dist/index.css'

import { createApp } from 'vue'
import pinia from "./stores/pinia";
import vuetify from "./plugins/vuetify";
import Toast from 'vue-toastification'


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(Toast)

app.mount('#app')
