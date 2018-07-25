# electron-color-picker

[![i:npm]][l:npm]
[![i:lint]][l:lint]

Pick color from Desktop, suitable for use with Electron.

On Windows & MacOS will use our native color-picker.

On Linux will use [SCROT][l:scrot] to get screenshot and pick color from it.
The idea is directly borrowed from package [desktop-screenshot][l:desktop-screenshot].

Error will be thrown:
- when try to start multiple color-picker.
- on unsupported platform.

#### Usage:

```js
import { clipboard } from 'electron'
import { getColorHexRGB } from 'electron-color-picker'

const getColor = async () => {
  // color may be `#0099ff` or `` (pick cancelled)
  const color = await getColorHexRGB().catch((error) => {
    console.warn(`[ERROR] getColor`, error)
    return ''
  })

  console.log(`getColor: ${color}`)
  color && clipboard.writeText(color)
}
```

[i:npm]: https://img.shields.io/npm/v/electron-color-picker.svg
[l:npm]: https://www.npmjs.com/package/electron-color-picker
[i:lint]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[l:lint]: https://standardjs.com
[l:scrot]: https://en.wikipedia.org/wiki/Scrot
[l:desktop-screenshot]: https://www.npmjs.com/package/desktop-screenshot
