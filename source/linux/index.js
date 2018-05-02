import { readFileSync, unlinkSync } from 'fs'
import { format as formatUrl } from 'url'
import { join as joinPath } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

import { BrowserWindow, app, screen } from 'electron'

import { runLinuxSCROT } from './linux-scrot'

const execAsync = promisify(exec)

const formatFileUrl = (...args) => formatUrl({
  pathname: joinPath(...args),
  protocol: 'file',
  slashes: true
})

const tryCreateScreenshotFile = async (tempOutputFile) => {
  try { return await execAsync(`gnome-screenshot --file ${tempOutputFile}`, { shell: true }) } catch (error) {}
  try { return await execAsync(`import -window root ${tempOutputFile}`, { shell: true }) } catch (error) {}
  await runLinuxSCROT(tempOutputFile)
}

// get screenshot
const createDataUrlFromBuffer = (buffer, MIME) => `data:${MIME};base64,${buffer.toString('base64')}`
const loadImageFileAsDataUrl = (imagePath, MIME = 'image/png') => createDataUrlFromBuffer(readFileSync(imagePath), MIME)
const getScreenshotDataUrl = async () => {
  const tempOutputFile = joinPath(app.getPath('temp'), 'temp-screenshot.png')

  await tryCreateScreenshotFile(tempOutputFile)

  const imageDataUrl = await loadImageFileAsDataUrl(tempOutputFile)
  unlinkSync(tempOutputFile)
  return imageDataUrl
}

// pick color
const pickColorWithBrowserWindow = async ({ imageDataUrl }) => {
  const { width, height } = screen.getPrimaryDisplay().bounds
  if (!width || !height) throw new Error(`[pickColorWithBrowserWindow] invalid display bounds: ${JSON.stringify({ width, height })}`)

  const browserWindow = new BrowserWindow({
    width,
    height,
    frame: false,
    resizable: false,
    scrollable: false,
    fullscreen: true,
    alwaysOnTop: true,
    enableLargerThanScreen: true,
    titleBarStyle: 'hidden'
  })

  browserWindow.webContents.loadURL(formatFileUrl(__dirname, 'pick-color.html'))

  const colorHex = await new Promise((resolve) => {
    browserWindow.on('closed', () => { resolve('') })
    browserWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key !== 'Escape') return
      event.preventDefault()
      resolve('')
    })
    browserWindow.webContents.executeJavaScript(`window.PICK_COLOR({ IMAGE_DATA_URL: ${JSON.stringify(imageDataUrl)}, ZOOM: 10, GRID_COUNT: 17 })`)
      .then(resolve)
  })
  __DEV__ && console.log('[pickColorWithBrowserWindow] PICK_COLOR:', { colorHex })

  browserWindow.close()

  return colorHex
}

const runColorPicker = async () => {
  const imageDataUrl = await getScreenshotDataUrl()
  const possibleColorString = await pickColorWithBrowserWindow({ imageDataUrl })
  return { possibleColorString }
}

export { runColorPicker }
