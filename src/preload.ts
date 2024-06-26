import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    generateLyrics: (params: { theme: string; mood: string; style: string }) => 
        ipcRenderer.invoke('generate-lyrics', params),
    analyzeLyrics: (lyrics: string) => 
        ipcRenderer.invoke('analyze-lyrics', lyrics)
});