const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(app.getPath('userData'), 'estoque-data');
const PRODUTOS_FILE = path.join(DATA_DIR, 'produtos.json');
const MOV_FILE = path.join(DATA_DIR, 'movimentacoes.json');

// 👇 Caminho do ícone (funciona em dev e empacotado)
const ICON_PATH = path.join(__dirname, 'teste.png');

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PRODUTOS_FILE)) fs.writeFileSync(PRODUTOS_FILE, '[]', 'utf-8');
  if (!fs.existsSync(MOV_FILE)) fs.writeFileSync(MOV_FILE, '[]', 'utf-8');
}

function readJSON(file) {
  try {
    ensureStorage();
    const raw = fs.readFileSync(file, 'utf-8');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Erro ao ler JSON:', err);
    const backup = file + '.bak';
    if (fs.existsSync(backup)) {
      try { return JSON.parse(fs.readFileSync(backup, 'utf-8')); } catch { return []; }
    }
    return [];
  }
}

function writeJSON(file, data) {
  ensureStorage();
  const tmp = file + '.tmp';
  const backup = file + '.bak';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  if (fs.existsSync(file)) fs.copyFileSync(file, backup);
  fs.renameSync(tmp, file);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    icon: ICON_PATH,                    // 👈 ícone da janela / barra de tarefas
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

ipcMain.handle('produtos:listar', () => readJSON(PRODUTOS_FILE));
ipcMain.handle('produtos:salvar', (_e, produtos) => {
  writeJSON(PRODUTOS_FILE, produtos);
  return true;
});

ipcMain.handle('movimentacoes:listar', () => readJSON(MOV_FILE));
ipcMain.handle('movimentacoes:salvar', (_e, movs) => {
  writeJSON(MOV_FILE, movs);
  return true;
});

app.whenReady().then(() => {
  ensureStorage();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});