# Specification

* [Export Path](#export-path)
* [Package](#package)

#### Export Path
+ 📄 [source/index.js](source/index.js)
  - `DARWIN_IS_PLATFORM_PRE_CATALINA`, `darwinGetColorHexRGB`, `darwinGetScreenPermissionGranted`, `darwinRequestScreenPermissionPopup`, `getColorHexRGB`
+ 📄 [source/darwin/index.js](source/darwin/index.js)
  - `DARWIN_IS_PLATFORM_PRE_CATALINA`, `darwinGetScreenPermissionGranted`, `darwinRequestScreenPermissionPopup`, `darwinRunColorPicker`, `runColorPicker`
+ 📄 [source/linux/index.js](source/linux/index.js)
  - `runColorPicker`
+ 📄 [source/linux/linux-scrot/index.js](source/linux/linux-scrot/index.js)
  - `runLinuxSCROT`
+ 📄 [source/win32/index.js](source/win32/index.js)
  - `runColorPicker`

#### Package
📄 [package.json](package.json)
> ```
> {
>   "engines": {
>     "node": ">=8.2.1"
>   },
>   "peerDependencies": {
>     "electron": ">=1.8.1"
>   }
> }
> ```
