import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import router from './router'

createApp(App).use(router).mount('#app').$nextTick(() => {
  console.log('App mounted.');
  if (window.ipcRenderer) {
    console.log('ipcRenderer found.');
    window.ipcRenderer.on('main-process-message', (_event, message) => {
      console.log('Main process message:', message)
    })
  } else {
    console.error('ipcRenderer NOT found. Preload script might have failed.');
  }
})
