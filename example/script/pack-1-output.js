import { resolve } from 'path'

import ElectronPackager from 'electron-packager'
import debug from 'debug'

import { modify } from 'dr-js/module/node/file/Modify'

import { runMain } from 'dr-dev/module/main'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../pack-1-output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)

const getElectronVersion = () => {
  const { version: electronVersion } = require(fromRoot('node_modules/electron/package.json'))
  return electronVersion
}

const APP_NAME = 'ExampleApp'

runMain(async (logger) => {
  const { padLog, log } = logger

  padLog('reset output')
  await modify.delete(fromOutput()).catch(() => {})

  padLog('build with "electron-packager" (may auto download electron)')
  debug('electron-packager').enabled = true // debug.enable('*')
  const electronPackagerOutputList = await ElectronPackager({
    electronVersion: getElectronVersion(),
    platform: process.platform,
    arch: process.arch,
    asar: true, // set to false for unpacked code source
    dir: fromRoot('pack-0-source-gitignore/'),
    out: fromOutput(),
    name: APP_NAME,
    appVersion: '0.0.0',
    appCopyright: `Copyright © ${new Date().getFullYear()} MockingBot`,
    // darwin
    appBundleId: 'com.mockingbot.electron-color-picker',
    appCategoryType: 'public.app-category.developer-tools',
    // win32
    win32metadata: {
      ProductName: 'example',
      FileDescription: 'electron-color-picker',
      CompanyName: 'mockingbot'
    }
  })
  log('electronPackagerOutputList:', electronPackagerOutputList)

  const [ electronPackagerOutput ] = electronPackagerOutputList // only one output since this is single arch packing
  const PATH_ELECTRON_COLOR_PICKER = fromRoot(electronPackagerOutput, process.platform !== 'darwin'
    ? 'resources/electron-color-picker'
    : `${APP_NAME}.app/Contents/Resources/electron-color-picker`
  )

  padLog('copy "electron-color-picker" to output')
  await modify.copy(fromRoot('node_modules/electron-color-picker/'), PATH_ELECTRON_COLOR_PICKER)
  log('copied to:', PATH_ELECTRON_COLOR_PICKER)

  padLog('trim extra platform from "electron-color-picker" (OPTIONAL)') // Optional, to make output package smaller
  process.platform !== 'win32' && await modify.delete(fromOutput(PATH_ELECTRON_COLOR_PICKER, 'library/win32/'))
  process.platform !== 'linux' && await modify.delete(fromOutput(PATH_ELECTRON_COLOR_PICKER, 'library/linux/'))
  process.platform !== 'darwin' && await modify.delete(fromOutput(PATH_ELECTRON_COLOR_PICKER, 'library/darwin/'))
}, 'pack-1-output')
