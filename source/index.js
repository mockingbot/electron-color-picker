const DEFAULT_RUN_COLOR_PICKER = () => { throw new Error(`[electron-color-picker] unsupported ${process.platform}-${process.arch}`) }
const runColorPicker = (() => {
  let runColorPicker
  try {
    runColorPicker = require(`./${process.platform}`).runColorPicker
  } catch (error) { __DEV__ && console.warn(`[electron-color-picker] error require('./${process.platform}')`, error) }
  return runColorPicker || DEFAULT_RUN_COLOR_PICKER
})()

const REGEXP_COLOR_HEX_RGB = /#[A-F0-9]{6}/
const getColorHexRGB = async () => {
  const { possibleColorString } = await runColorPicker()
  const [ colorHex ] = REGEXP_COLOR_HEX_RGB.exec(possibleColorString.toUpperCase()) || []
  if (!colorHex) throw new Error(`[electron-color-picker] failed to get hex color from: ${possibleColorString}`)
  return colorHex
}

export { getColorHexRGB }
