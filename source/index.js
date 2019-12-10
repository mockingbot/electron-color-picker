const DEFAULT_RUN_COLOR_PICKER = () => { throw new Error(`[electron-color-picker] unsupported ${process.platform}-${process.arch}`) }
const DEFAULT_NO_FUNC = () => { throw new Error(`[electron-color-picker] no func for ${process.platform}-${process.arch}`) }

const {
  runColorPicker = DEFAULT_RUN_COLOR_PICKER,
  getDarwinScreenPermissionGranted = DEFAULT_NO_FUNC, // darwin only, throw error on other platform
  requestDarwinScreenPermissionPopup = DEFAULT_NO_FUNC // darwin only, throw error on other platform
} = (() => {
  try {
    return require(`./${process.platform}`) // TODO: NOTE: this is a `dynamic` require
  } catch (error) { __DEV__ && console.warn(`[electron-color-picker] error require('./${process.platform}')`, error) }
  return {}
})()

let isRunning = false
const mutexRunColorPicker = async (asyncFunc, ...args) => {
  if (isRunning) throw new Error('color picker already running!')
  isRunning = true
  const result = await asyncFunc(...args)
  isRunning = false
  return result
}

const REGEXP_COLOR_HEX_RGB = /#[A-F0-9]{6}/
const getColorHexRGB = async () => {
  const { possibleColorString } = await mutexRunColorPicker(runColorPicker)
  const [ colorHex ] = REGEXP_COLOR_HEX_RGB.exec(possibleColorString.toUpperCase()) || [ '' ]
  __DEV__ && console.log(`[electron-color-picker] get hex color: [${colorHex}] from: ${possibleColorString}`)
  return colorHex
}

const darwinGetScreenPermissionGranted = async () => {
  const { isDarwinScreenPermissionGranted } = await mutexRunColorPicker(getDarwinScreenPermissionGranted)
  __DEV__ && console.log(`[electron-color-picker] isDarwinScreenPermissionGranted: ${isDarwinScreenPermissionGranted}`)
  return isDarwinScreenPermissionGranted
}

const darwinRequestScreenPermissionPopup = async (appBundleId) => {
  if (!appBundleId) throw new Error('[electron-color-picker] appBundleId expected')
  await mutexRunColorPicker(requestDarwinScreenPermissionPopup, appBundleId)
  return getDarwinScreenPermissionGranted() // get and return result
}

export {
  getColorHexRGB,
  darwinGetScreenPermissionGranted, // darwin only, throw error on other platform
  darwinRequestScreenPermissionPopup // darwin only, throw error on other platform
}
