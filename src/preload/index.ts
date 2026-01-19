import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  fetchUsers: () => ipcRenderer.invoke('get-users'),
  createUser: (data : any) => ipcRenderer.invoke('add-user', data)
})