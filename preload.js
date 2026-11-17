const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  produtos: {
    listar: () => ipcRenderer.invoke('produtos:listar'),
    salvar: (produtos) => ipcRenderer.invoke('produtos:salvar', produtos)
  },
  movimentacoes: {
    listar: () => ipcRenderer.invoke('movimentacoes:listar'),
    salvar: (movs) => ipcRenderer.invoke('movimentacoes:salvar', movs)
  }
});