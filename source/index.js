const DEFAULT_UNSUPPORTED = () => { throw new Error(`[electron-color-picker] unsupported ${process.platform}-${process.arch}`) }

const {
  runColorPicker = DEFAULT_UNSUPPORTED,

  darwinRunColorPicker: __darwinRunColorPicker = DEFAULT_UNSUPPORTED,
  darwinGetScreenPermissionGranted: __darwinGetScreenPermissionGranted = DEFAULT_UNSUPPORTED,
  darwinRequestScreenPermissionPopup: __darwinRequestScreenPermissionPopup = DEFAULT_UNSUPPORTED
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

const darwinRunColorPicker = async () => {
  const { possibleColorString } = await mutexRunColorPicker(__darwinRunColorPicker)
  const [ colorHex ] = REGEXP_COLOR_HEX_RGB.exec(possibleColorString.toUpperCase()) || [ '' ]
  __DEV__ && console.log(`[electron-color-picker] get hex color: [${colorHex}] from: ${possibleColorString}`)
  return colorHex
}

const darwinGetScreenPermissionGranted = async () => {
  const { isDarwinScreenPermissionGranted } = await mutexRunColorPicker(__darwinGetScreenPermissionGranted)
  __DEV__ && console.log(`[electron-color-picker] isDarwinScreenPermissionGranted: ${isDarwinScreenPermissionGranted}`)
  return isDarwinScreenPermissionGranted
}

const darwinRequestScreenPermissionPopup = async () => {
  await mutexRunColorPicker(__darwinRequestScreenPermissionPopup)
  return darwinGetScreenPermissionGranted() // get and return result
}

export {
  getColorHexRGB,

  darwinRunColorPicker, // darwin only, throw error on other platform
  darwinGetScreenPermissionGranted, // darwin only, throw error on other platform
  darwinRequestScreenPermissionPopup // darwin only, throw error on other platform
}
