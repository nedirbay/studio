/// <reference types="vite/client" />

interface IElectronAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  on: (channel: string, listener: (event: any, ...args: any[]) => void) => any;
  off: (channel: string, listener: (event: any, ...args: any[]) => void) => any;
  send: (channel: string, ...args: any[]) => any;
}

declare global {
  interface Window {
    ipcRenderer: IElectronAPI
  }
}
