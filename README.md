# electron-color-picker

[![i:npm]][l:npm]
[![i:size]][l:size]
[![i:npm-dev]][l:npm]

Pick color from Desktop, in Electron.

[i:npm]: https://img.shields.io/npm/v/electron-color-picker?colorB=blue
[i:npm-dev]: https://img.shields.io/npm/v/electron-color-picker/dev
[l:npm]: https://npm.im/electron-color-picker
[i:size]: https://packagephobia.now.sh/badge?p=electron-color-picker
[l:size]: https://packagephobia.now.sh/result?p=electron-color-picker

[//]: # (NON_PACKAGE_CONTENT)

> #### Note
> 
> On Windows & MacOS will use our native [color-picker](https://github.com/mockingbot/mb_colorpicker_desktop_native).
> 
> On Linux will use [SCROT][l:scrot] to get screenshot and pick color from it.
> The idea is directly borrowed from package [desktop-screenshot][l:desktop-screenshot].
> 
> Error will be thrown:
> - when try to start multiple color-picker.
> - on unsupported platform.


## Example

📁 [example/](example/)

Basic implementation of using DOM Button to trigger color picking,
and pass result back through `ipc`.

Try example with:
```bash
cd example/

npm install

npm run-dev # for debug with electron
# or
npm run-prod # for electron-packager output
```

for a more detailed explanation of the example setup,
check: [example/concept.md](example/concept.md)


## Usage

First add this package to your project: 
```bash
npm install electron-color-picker
```

Sample function `saveColorToClipboard()`:
```js
const { clipboard } = require('electron')
const { getColorHexRGB } = require('electron-color-picker') // TODO: NOTE: this can not be directly packed for release, check below

const saveColorToClipboard = async () => {
  // color may be `#0099ff` or `` (pick cancelled with ESC)
  const color = await getColorHexRGB().catch((error) => {
    console.warn(`[ERROR] getColor`, error)
    return ''
  })

  console.log(`getColor: ${color}`)
  color && clipboard.writeText(color)
}

const darwinScreenPermissionSample = async () => { // darwin only, throw error on other platform (since electron-color-picker@2)
  const { darwinGetScreenPermissionGranted, darwinRequestScreenPermissionPopup } = require('electron-color-picker')

  // initial check
  const isGranted = await darwinGetScreenPermissionGranted()
  console.log('darwinGetScreenPermissionGranted:', isGranted)

  if (!isGranted) { // request user for permission
    const isGranted = await darwinRequestScreenPermissionPopup('com.github.Electron') // use default Electron bundle id for test without repacking, replace with actual bundle id when releasing
    console.log('darwinRequestScreenPermissionPopup:', isGranted)
  }
}
```


## About release packaging

To use this package in released Electron app,
some custom repack steps is required.
(mainly for platform darwin (OSX), since the binary has external resource file)

Most Electron app use `electron-packager`,
and generate a output directory structure like:
```
./
  resources/
    app.asar # this should be your packed js code & other resource
    electron.asar
  locales/
  swiftshader/
  resources.pak
  chrome_100_percent.pak
  ...
```

- One option is to set option `asar: false` for `electron-packager`,
  and all file `resources/app.asar` will be unpacked into `resources/app/`

- Another option is to use script to create a output directory structure like:
  ```
  ./
    resources/
      electron-color-picker/ # copy from `node_modules`
        ...
      app.asar
      electron.asar
    ...
  ```
  And in JS code, require from path like:
  `const { getColorHexRGB } = require('../electron-color-picker')`
  Check `example/` for this implementation.


[l:scrot]: https://en.wikipedia.org/wiki/Scrot
[l:desktop-screenshot]: https://npm.im/desktop-screenshot
