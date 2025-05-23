import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron' // Added dialog
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC handler for selecting a directory
  ipcMain.handle('select-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    if (canceled || filePaths.length === 0) {
      return null;
    }
    return filePaths[0];
  });

  // IPC handler for downloading Hugging Face models
  ipcMain.handle('download-hf-model', async (event, { modelName, downloadPathBase }) => {
    const modelFilesApiUrl = `https://huggingface.co/api/models/${modelName}/tree/main`;
    const modelDownloadBaseUrl = `https://huggingface.co/${modelName}/resolve/main/`;
    const modelSpecificPath = path.join(downloadPathBase, modelName.replace('/', '_')); // Use replace to avoid issues with slashes in paths

    try {
      if (!fs.existsSync(modelSpecificPath)) {
        fs.mkdirSync(modelSpecificPath, { recursive: true });
      }

      const response = await fetch(modelFilesApiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch model file list from ${modelFilesApiUrl}: ${response.statusText}`);
      }
      const files = await response.json();

      if (!Array.isArray(files)) {
          throw new Error(`Invalid response structure from ${modelFilesApiUrl}. Expected an array of files.`);
      }

      for (const fileInfo of files) {
        if (fileInfo.type === 'file') {
          const filePath = fileInfo.path;
          const fileUrl = `${modelDownloadBaseUrl}${filePath}`;
          const localFilePath = path.join(modelSpecificPath, filePath);
          
          const dirForFile = path.dirname(localFilePath);
          if (!fs.existsSync(dirForFile)) {
            fs.mkdirSync(dirForFile, { recursive: true });
          }

          // TODO: Send progress update to renderer: event.sender.send('download-progress', { modelName, file: filePath, progress: 0 });
          console.log(`Downloading ${fileUrl} to ${localFilePath}...`);
          
          const fileResponse = await fetch(fileUrl);
          if (!fileResponse.ok) {
            console.error(`Failed to download ${fileUrl}: ${fileResponse.statusText}`);
            continue; 
          }
          
          const fileStream = fs.createWriteStream(localFilePath);
          await new Promise((resolve, reject) => {
            fileResponse.body.pipe(fileStream);
            fileResponse.body.on("error", reject);
            fileStream.on("finish", resolve);
          });
          
          // TODO: Send progress update to renderer: event.sender.send('download-progress', { modelName, file: filePath, progress: 100 });
          console.log(`Downloaded ${filePath} successfully.`);
        }
      }
      return { success: true, message: `Model ${modelName} downloaded successfully to ${modelSpecificPath}` };
    } catch (error) {
      console.error(`Error downloading model ${modelName}:`, error);
      // Ensure error is serializable
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, message: errorMessage || "Unknown error during model download." };
    }
  });

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
