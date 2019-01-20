import { BrowserWindow, app } from 'electron';

app.on('ready', async () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    const devPath = 'http://localhost:1124';

    mainWindow.setMenu(null);
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL(devPath);
    } else {
        mainWindow.loadFile('dist/index.html');
    }
    mainWindow.webContents.openDevTools();
});
