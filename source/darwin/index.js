import { execFile as execFileFromAsar } from 'child_process' // CHECK: https://electronjs.org/docs/tutorial/application-packaging#executing-binaries-inside-asar-archive
import { release } from 'os'
import { join } from 'path'

import { getDarwinMainBundleIdHackAsync } from './darwinMainBundleIdHack' // hack for detecting mainBundleId

const PATH_BINARY = join(__dirname, 'ColorPicker')

// check: https://github.com/sindresorhus/macos-release/blob/master/index.js
const DARWIN_IS_PLATFORM_PRE_CATALINA = Number(release().split('.')[ 0 ]) < 19 // less than 19.0.0 (macOS 10.15 Catalina)

const darwinRunColorPicker = () => new Promise((resolve, reject) => execFileFromAsar(PATH_BINARY, (error, stdout, stderr) => {
  if (error) return reject(error)
  __DEV__ && console.log('[runColorPicker]', { stdout, stderr })
  resolve({ possibleColorString: stdout })
}))

const darwinGetScreenPermissionGranted = DARWIN_IS_PLATFORM_PRE_CATALINA
  ? () => Promise.resolve(true)
  : () => new Promise((resolve, reject) => execFileFromAsar(PATH_BINARY, [ '--mode=1' ], (error, stdout, stderr) => {
    if (error) return reject(error)
    const isDarwinScreenPermissionGranted = stdout.includes('Permission Granted: YES')
    __DEV__ && console.log('[darwinGetScreenPermissionGranted]', { stdout, stderr, isDarwinScreenPermissionGranted })
    resolve(isDarwinScreenPermissionGranted)
  }))

let mainBundleId
const darwinRequestScreenPermissionPopup = DARWIN_IS_PLATFORM_PRE_CATALINA
  ? () => Promise.resolve()
  : async () => {
    if (mainBundleId === undefined) mainBundleId = await getDarwinMainBundleIdHackAsync()
    await new Promise((resolve, reject) => execFileFromAsar(PATH_BINARY, [ '--mode=2', `--bundle-id=${mainBundleId}` ], (error, stdout, stderr) => {
      if (error) return reject(error)
      __DEV__ && console.log('[darwinRequestScreenPermissionPopup]', { stdout, stderr })
      resolve() // popup only, no permission result returned, will not wait for user to click anything
    }))
  }

const runColorPicker = DARWIN_IS_PLATFORM_PRE_CATALINA
  ? darwinRunColorPicker
  : async () => { // slower all-in-one
    if (await darwinGetScreenPermissionGranted() === false) {
      await darwinRequestScreenPermissionPopup()
      return { possibleColorString: '' } // bail and wait for next permission check
    }
    return darwinRunColorPicker()
  }

export {
  DARWIN_IS_PLATFORM_PRE_CATALINA,
  darwinRunColorPicker,
  darwinGetScreenPermissionGranted,
  darwinRequestScreenPermissionPopup,

  runColorPicker
}
