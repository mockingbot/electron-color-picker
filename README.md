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
const {
  getColorHexRGB,

  // for more control and customized checks
  DARWIN_IS_PLATFORM_PRE_CATALINA, // darwin only, undefined on other platform
  darwinRunColorPicker, // darwin only, throw error on other platform
  darwinGetScreenPermissionGranted, // darwin only, throw error on other platform
  darwinRequestScreenPermissionPopup // darwin only, throw error on other platform
} = require('electron-color-picker')

const saveColorToClipboard = async () => {
  // color may be '#0099ff' or '' (pick cancelled with ESC)
  const color = await getColorHexRGB().catch((error) => {
    console.warn('[ERROR] getColor', error)
    return ''
  })
  console.log(`getColor: ${color}`)
  color && clipboard.writeText(color)
}

if (process.platform === 'darwin' && !DARWIN_IS_PLATFORM_PRE_CATALINA) {
  const darwinScreenPermissionSample = async () => {
    let isGranted = await darwinGetScreenPermissionGranted() // initial check
    console.log('darwinGetScreenPermissionGranted:', isGranted)

    if (!isGranted) { // request user for permission
      isGranted = await darwinRequestScreenPermissionPopup()
      console.log('darwinRequestScreenPermissionPopup:', isGranted)
    }

    if (!isGranted) return console.warn('no permission granted')
    const color = await darwinRunColorPicker().catch((error) => {
      console.warn('[ERROR] getColor', error)
      return ''
    })
    console.log(`getColor: ${color}`)
    color && clipboard.writeText(color)
  }
}
```


[l:scrot]: https://en.wikipedia.org/wiki/Scrot
[l:desktop-screenshot]: https://npm.im/desktop-screenshot
