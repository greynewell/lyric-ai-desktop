import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { pipeline, Pipeline } from '@xenova/transformers';

let mainWindow: BrowserWindow | null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

let generator: any;
let classifier: any;
let sentimentAnalyzer: any;

(async () => {
    generator = await pipeline('text-generation', 'gpt2');
    classifier = await pipeline('text-classification', 'distilbert-base-uncased-finetuned-sst-2-english');
    sentimentAnalyzer = await pipeline('sentiment-analysis');
})();

interface LyricGenerationParams {
    theme: string;
    mood: string;
    style: string;
}

ipcMain.handle('generate-lyrics', async (event, params: LyricGenerationParams) => {
    const prompt = `Generate ${params.style} song lyrics about ${params.theme} with a ${params.mood} mood:\n`;
    const result = await generator(prompt, { max_new_tokens: 100 });
    return result[0].generated_text;
});

ipcMain.handle('analyze-lyrics', async (event, lyrics: string) => {
    const sentimentResult = await sentimentAnalyzer(lyrics);
    const themeResult = await classifier(lyrics);
    const plagiarismScore = Math.random();

    return {
        sentiment: sentimentResult[0].label,
        theme: themeResult[0].label,
        plagiarismScore
    };
});