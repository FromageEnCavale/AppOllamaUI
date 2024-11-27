const {app, BrowserWindow} = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

const windowStateFilePath = path.join(app.getPath('userData'), 'window-state.json');

const loadWindowBounds = () => {
    try {
        return fs.existsSync(windowStateFilePath)
            ? JSON.parse(fs.readFileSync(windowStateFilePath, 'utf8'))
            : null;
    } catch (e) {
        console.error('Erreur lors du chargement de l\'état de la fenêtre :', e);
        return null;
    }
};

const saveWindowBounds = (bounds) => {
    try {
        fs.writeFileSync(windowStateFilePath, JSON.stringify(bounds));
    } catch (e) {
        console.error('Erreur lors de la sauvegarde de l\'état de la fenêtre :', e);
    }
};

const createMainWindow = () => {
    const savedBounds = loadWindowBounds() || {};

    mainWindow = new BrowserWindow({
        width: savedBounds.width || 850,
        height: savedBounds.height || 850,
        x: savedBounds.x,
        y: savedBounds.y,
        show: false,
        webPreferences: {nodeIntegration: true},
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => mainWindow.show());

    mainWindow.on('close', () => saveWindowBounds(mainWindow.getBounds()));
    mainWindow.on('closed', () => mainWindow = null);
};

app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});