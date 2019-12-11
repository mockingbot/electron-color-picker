import { join } from 'path'
import { app, ipcMain, BrowserWindow } from 'electron'
import {
  getColorHexRGB,
  darwinGetScreenPermissionGranted,
  darwinRequestScreenPermissionPopup
} from './electronColorPicker'

const PATH_HTML_FILE = join(__dirname, '../renderer/index.html')
const PATH_PRELOAD = join(__dirname, '../renderer/preload.js')

const isDarwin = process.platform === 'darwin'

app.on('window-all-closed', () => {
  app.quit()
})

app.on('ready', async () => {
  const addIpcTask = (pingEvent, pongEvent, taskFunc) => ipcMain.addListener(pingEvent, async (ipcEvent) => {
    console.log(`[${pingEvent}] start`)
    const { result, error } = await taskFunc().then(
      (result) => ({ result }),
      (error) => ({ error })
    )
    console.log(`[${pingEvent}] done`, { result, error })
    !ipcEvent.sender.isDestroyed() && ipcEvent.sender.send(pongEvent, { result, error })
  })

  addIpcTask(
    'main:ipc-task:color-picker',
    'renderer:ipc-task:color-picker:result',
    getColorHexRGB
  )
  isDarwin && addIpcTask(
    'main:ipc-task:darwin-permission-check',
    'renderer:ipc-task:darwin-permission-check:result',
    darwinGetScreenPermissionGranted
  )
  isDarwin && addIpcTask(
    'main:ipc-task:darwin-permission-request',
    'renderer:ipc-task:darwin-permission-request:result',
    darwinRequestScreenPermissionPopup
  )

  const browserWindow = new BrowserWindow({ webPreferences: { nodeIntegration: false, preload: PATH_PRELOAD } })
  await browserWindow.webContents.loadFile(PATH_HTML_FILE)
  browserWindow.webContents.openDevTools()
  browserWindow.webContents.executeJavaScript(`console.log('try: "window.PRELOAD.GET_COLOR_HEX_RGB().then(console.log)"')`).catch(console.warn)
})
