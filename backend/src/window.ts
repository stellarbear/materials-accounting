import { BrowserWindow, app, ipcMain, Menu, IpcMessageEvent } from 'electron';
const isDev = require('electron-is-dev');
const path = require('path');
const url = require('url');

export const createWindow = async () => {
    let mainWindow: BrowserWindow = null;
    const gotTheLock = app.requestSingleInstanceLock()
    console.log(gotTheLock);

    if (!gotTheLock) {
        app.quit()
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore()
                mainWindow.focus()
            }
        })
    }

    mainWindow = new BrowserWindow({
        width: 2200, height: 680, webPreferences: {
            nodeIntegration: true,
        }
    });

    mainWindow.maximize();

    mainWindow.loadURL(isDev
        ? "http://localhost:3000"
        : url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        })
    );

    mainWindow.on("closed", () => (mainWindow.destroy()));

    ipcMain.on('channel', (event: IpcMessageEvent, msg: any) => {
        mainWindow.webContents.send('response', { title: 'mymessage', data: 1 });
    })

    var menu = Menu.buildFromTemplate(
        isDev
            ? [
                {
                    label: 'Frontend',
                    click() {
                        mainWindow.loadURL("http://localhost:3000");
                    }
                },
                {
                    label: 'Backend',
                    click() {
                        mainWindow.loadURL("http://localhost:4000/graphql");
                    }
                }] : [{
                    label: 'Обновить',
                    click() {
                        mainWindow.loadURL(url.format({
                            pathname: path.join(__dirname, 'index.html'),
                            protocol: 'file:',
                            slashes: true
                        }));
                    }
                }, {
                    label: 'Назад',
                    click() {
                        mainWindow.webContents.goBack();
                    }
                },]
    )

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    Menu.setApplicationMenu(menu);

    app.on("ready", createWindow);
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });
    app.on("activate", () => {
        if (mainWindow === null) {
            createWindow();
        }
    });
}
