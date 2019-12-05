import { join as joinPath } from 'path'
import { execFile as execFileFromAsar } from 'child_process' // CHECK: https://electronjs.org/docs/tutorial/application-packaging#executing-binaries-inside-asar-archive

const PATH_BINARY = joinPath(__dirname, 'ColorPicker')

const runColorPicker = () => new Promise((resolve, reject) => execFileFromAsar(PATH_BINARY, (error, stdout, stderr) => {
  if (error) return reject(error)
  __DEV__ && console.log('[runColorPicker]', { stdout, stderr })
  resolve({ possibleColorString: stdout })
}))

const getDarwinScreenPermissionGranted = () => new Promise((resolve, reject) => execFileFromAsar(PATH_BINARY, [ '--mode=1' ], (error, stdout, stderr) => {
  if (error) return reject(error)
  __DEV__ && console.log('[getDarwinScreenPermissionGranted]', { stdout, stderr })
  resolve({ isDarwinScreenPermissionGranted: stdout.includes('Permission Granted: YES') })
}))

const requestDarwinScreenPermissionPopup = (appBundleId) => new Promise((resolve, reject) => execFileFromAsar(PATH_BINARY, [ '--mode=2', `--bundle-id=${appBundleId}` ], (error, stdout, stderr) => {
  if (error) return reject(error)
  __DEV__ && console.log('[requestDarwinScreenPermissionPopup]', { stdout, stderr })
  resolve() // popup only, no permission result
}))

export {
  runColorPicker,
  getDarwinScreenPermissionGranted,
  requestDarwinScreenPermissionPopup
}
