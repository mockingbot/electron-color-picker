import { ipcRenderer } from 'electron'

// BrowserWindow.preload: Specifies a script that will be loaded before other scripts run in the page.

const isDarwin = process.platform === 'darwin'

process.once('loaded', () => { // expose to renderer process
  let lock = false
  const ipcPingPongAsync = (pingEvent, pongEvent) => new Promise((resolve, reject) => { // resolve to string hex color (#ffffff)
    if (lock) reject(new Error(`[ipcPingPongAsync] lock is on`))
    lock = true
    ipcRenderer.send(pingEvent)
    ipcRenderer.once(pongEvent, (ipcEvent, { error, result }) => {
      lock = false
      error ? reject(error) : resolve(result)
    })
  })

  window.PRELOAD = {
    GET_COLOR_HEX_RGB: () => ipcPingPongAsync( // resolve to string hex color (#ffffff)
      'main:ipc-task:color-picker',
      'renderer:ipc-task:color-picker:result'
    ),
    DARWIN_GET_SCREEN_PERMISSION_GRANTED: !isDarwin ? undefined : () => ipcPingPongAsync( // resolve to true/false
      'main:ipc-task:darwin-permission-check',
      'renderer:ipc-task:darwin-permission-check:result'
    ),
    DARWIN_REQUEST_SCREEN_PERMISSION_POPUP: !isDarwin ? undefined : () => ipcPingPongAsync( // resolve to true/false
      'main:ipc-task:darwin-permission-request',
      'renderer:ipc-task:darwin-permission-request:result'
    )
  }
})
