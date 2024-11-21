const {app, BrowserWindow} = require('electron');
const path = require('path');
const fs = require('fs');
const {exec} = require('child_process');

let mainWindow;
let otherAppProcess;

function saveWindowBounds(bounds) {

    const userDataPath = app.getPath('userData');

    const filePath = path.join(userDataPath, 'window-state.json');

    fs.writeFileSync(filePath, JSON.stringify(bounds));

}

function loadWindowBounds() {

    const userDataPath = app.getPath('userData');

    const filePath = path.join(userDataPath, 'window-state.json');

    try {

        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

    } catch (e) {

        console.error('Failed to load window state:', e);

    }

    return null;
}

function createMainWindow() {

    const savedBounds = loadWindowBounds();

    mainWindow = new BrowserWindow({
        width: savedBounds?.width || 850,
        height: savedBounds?.height || 850,
        x: savedBounds?.x || undefined,
        y: savedBounds?.y || undefined,
        show: false,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.on('close', () => {

        if (mainWindow) {
            const bounds = mainWindow.getBounds();
            saveWindowBounds(bounds);
        }

    });

}

app.on('ready', () => {

    otherAppProcess = exec('open -a "Ollama"', (error, stdout, stderr) => {

        if (error) {
            console.error(`Erreur lors du lancement de l'application : ${error.message}`);
            return;
        }

        console.log(`Application lancée avec succès : ${stdout}`);

    });

    createMainWindow();

});

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit();
    }

});

app.on('will-quit', () => {

    exec('pkill -f Ollama', (error, stdout, stderr) => {

        if (error) {
            console.error(`Erreur lors de la fermeture de l'application : ${error.message}`);
            return;
        }

        console.log('Application fermée avec succès');

    });

});

app.on('activate', () => {

    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }

});