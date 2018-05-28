const DEFAULT_RUN_COLOR_PICKER = () => { throw new Error(`[electron-color-picker] unsupported ${process.platform}-${process.arch}`) }
const runColorPicker = (() => {
  try {
    const { runColorPicker } = require(`./${process.platform}`)
    return runColorPicker
  } catch (error) { __DEV__ && console.warn(`[electron-color-picker] error require('./${process.platform}')`, error) }
  return DEFAULT_RUN_COLOR_PICKER
})()

const REGEXP_COLOR_HEX_RGB = /#[A-F0-9]{6}/
const getColorHexRGB = async () => {
  const { possibleColorString } = await runColorPicker()
  const [ colorHex ] = REGEXP_COLOR_HEX_RGB.exec(possibleColorString.toUpperCase()) || [ '' ]
  __DEV__ && console.log(`[electron-color-picker] get hex color: [${colorHex}] from: ${possibleColorString}`)
  return colorHex
}

export { getColorHexRGB }
