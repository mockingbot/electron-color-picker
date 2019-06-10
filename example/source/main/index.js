import { join } from 'path'
import { app, ipcMain, BrowserWindow } from 'electron'
import { getColorHexRGB } from './electronColorPicker'

const PATH_HTML_FILE = join(__dirname, '../renderer/index.html')
const PATH_PRELOAD = join(__dirname, '../renderer/preload.js')

app.on('window-all-closed', () => {
  app.quit()
})

app.on('ready', () => {
  const browserWindow = new BrowserWindow({ webPreferences: { nodeIntegration: false, preload: PATH_PRELOAD } })
  browserWindow.webContents.loadFile(PATH_HTML_FILE)
  browserWindow.webContents.openDevTools()
  browserWindow.webContents.executeJavaScript(`console.log('try: "window.GET_COLOR_HEX_RGB().then(console.log)"')`).catch(console.warn)

  ipcMain.addListener('main:ipc-task:color-picker', async (ipcEvent) => {
    console.log('[main:ipc-task:color-picker] start')
    const { result, error } = await getColorHexRGB().then(
      (result) => ({ result }),
      (error) => ({ error })
    )
    console.log('[main:ipc-task:color-picker] done', { result, error })
    !ipcEvent.sender.isDestroyed() && ipcEvent.sender.send('renderer:ipc-task:color-picker:result', { result, error })
  })
})
