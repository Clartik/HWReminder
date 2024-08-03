"use strict";
const { app, shell, BrowserWindow, remote, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadFile('./pages/home.html');
};
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
ipcMain.handle('json:getData', (event, filename) => {
    const filePath = path.join(__dirname, filename);
    // Read the file asynchronously (non-blocking)
    const data = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(data);
    return jsonData;
});
ipcMain.on('openLink', (event, url) => {
    try {
        shell.openExternal(url);
    }
    catch (_a) {
        dialog.showErrorBox('Could Not Open Assignment Post!', 'An Error Occured While Trying to Open the Assignment Post');
    }
});