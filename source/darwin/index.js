import { execFile as execFileFromAsar } from 'child_process' // CHECK: https://electronjs.org/docs/tutorial/application-packaging#executing-binaries-inside-asar-archive
import { release } from 'os'
import { join } from 'path'

import { getDarwinMainBundleIdHackAsync } from './darwinMainBundleIdHack' // hack for detecting mainBundleId

const PATH_BINARY = join(__dirname, 'ColorPicker')

const darwinRunColorPicker = () => new Promise((resolve, reject) => execFileFromAsar(PATH_BINARY, (error, stdout, stderr) => {
  if (error) return reject(error)
  __DEV__ && console.log('[runColorPicker]', { stdout, stderr })
  resolve({ possibleColorString: stdout })
}))

const darwinGetScreenPermissionGranted = () => new Promise((resolve, reject) => execFileFromAsar(PATH_BINARY, [ '--mode=1' ], (error, stdout, stderr) => {
  if (error) return reject(error)
  __DEV__ && console.log('[darwinGetScreenPermissionGranted]', { stdout, stderr })
  resolve({ isDarwinScreenPermissionGranted: stdout.includes('Permission Granted: YES') })
}))

let mainBundleId
const darwinRequestScreenPermissionPopup = async () => {
  if (mainBundleId === undefined) mainBundleId = await getDarwinMainBundleIdHackAsync()
  await new Promise((resolve, reject) => execFileFromAsar(PATH_BINARY, [ '--mode=2', `--bundle-id=${mainBundleId}` ], (error, stdout, stderr) => {
    if (error) return reject(error)
    __DEV__ && console.log('[darwinRequestScreenPermissionPopup]', { stdout, stderr })
    resolve() // popup only, no permission result
  }))
}

// check: https://github.com/sindresorhus/macos-release/blob/master/index.js
const IS_MACOS_LOWER_THAN_CATALINA = Number(release().split('.')[ 0 ]) < 19

let isPermissionGranted
const runColorPicker = IS_MACOS_LOWER_THAN_CATALINA
  ? darwinRunColorPicker
  : async () => {
    if (isPermissionGranted === undefined) isPermissionGranted = await darwinGetScreenPermissionGranted()
    if (isPermissionGranted === false) {
      await darwinRequestScreenPermissionPopup()
      isPermissionGranted = await darwinGetScreenPermissionGranted()
      if (!isPermissionGranted) return '' // denied permission
    }
    return darwinRunColorPicker()
  }

export {
  darwinRunColorPicker,
  darwinGetScreenPermissionGranted,
  darwinRequestScreenPermissionPopup,

  runColorPicker
}
