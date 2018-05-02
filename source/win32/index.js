import { join as joinPath } from 'path'
import { execFile as execFileFromAsar } from 'child_process' // CHECK: https://electronjs.org/docs/tutorial/application-packaging#executing-binaries-inside-asar-archive

const runColorPicker = () => new Promise((resolve, reject) => execFileFromAsar(
  joinPath(__dirname, 'mockingbot-color-picker-ia32.exe'),
  (error, stdout, stderr) => {
    if (error) return reject(error)
    __DEV__ && console.log('[runColorPicker]', { stdout, stderr })
    resolve({ possibleColorString: stdout })
  }
))

export { runColorPicker }
