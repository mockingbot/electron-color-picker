# electron-color-picker

[![i:npm]][l:npm]
[![i:lint]][l:lint]

Pick color from Desktop, suitable for use with Electron.

On Windows & MacOS will use our native color-picker.

On Linux will use `SCROT` to get screenshot and pick color from it.
The idea is directly borrowed from package [desktop-screenshot][l:npm:desktop-screenshot].

#### Usage:

```js
import { clipboard } from 'electron'
import { getColorHexRGB } from 'electron-color-picker'

const getColor = async () => {
  const color = await getColorHexRGB()
  color && clipboard.writeText(color)
}
```

[i:npm]: https://img.shields.io/npm/v/electron-color-picker.svg
[l:npm]: https://www.npmjs.com/package/electron-color-picker
[i:lint]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[l:lint]: https://standardjs.com
[l:npm:desktop-screenshot]: https://img.shields.io/npm/v/desktop-screenshot.svg
