const {
  getColorHexRGB,
  darwinGetScreenPermissionGranted,
  darwinRequestScreenPermissionPopup
} = __DEV__
  // development: can try all place (OPTIONAL, use this trick only if needed)
  ? (() => {
    try { return require('electron-color-picker') } catch (error) {}
    try { return require('../electron-color-picker') } catch (error) {}
    try { return require('../../electron-color-picker') } catch (error) {}
  })()
  // production: will only use from `resources/electron-color-picker`
  : require('../../electron-color-picker')

export {
  getColorHexRGB,
  darwinGetScreenPermissionGranted,
  darwinRequestScreenPermissionPopup
}
