const { ipcRenderer } = require('electron')

// BrowserWindow.preload: Specifies a script that will be loaded before other scripts run in the page.

process.once('loaded', () => { // expose to renderer process
  let lock = false
  window.GET_COLOR_HEX_RGB = () => new Promise((resolve, reject) => { // resolve to string hex color (#ffffff)
    if (lock) reject(new Error(`[color-picker] lock is on`))
    lock = true
    ipcRenderer.send('main:ipc-task:color-picker')
    ipcRenderer.once('renderer:ipc-task:color-picker:result', (ipcEvent, { error, result }) => {
      lock = false
      error ? reject(error) : resolve(result)
    })
  })
})
