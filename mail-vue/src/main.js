import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';
import VueCropper from 'vue-cropper';
import 'vue-cropper/dist/index.css'
import { init } from '@/init/init.js';
import { createPinia } from 'pinia';
import piniaPersistedState from 'pinia-plugin-persistedstate';
import perm from "@/directives/perm.js";
const pinia = createPinia().use(piniaPersistedState)
const app = createApp(App).use(pinia)
await init()
app.use(router).use(VueCropper).directive('perm',perm)
app.config.devtools = true;

app.mount('#app');
