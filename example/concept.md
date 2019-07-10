## concept

The idea of the example is to show a working Electron app project setup,
with most of the code inside `app.asar`,
but also can `require` and use `electron-color-picker`.

A special delegate `require` file is needed:
`example/source/main/electronColorPicker.js` to switch path between dev/prod mode,
to access the correct `electron-color-picker` code.

This minimal setup is extracted from our app build script.
It should allow:
- Develop with unpacked `electron`
- Build packed `electron` app

And will put output file to 2 extra folder:
- `./pack-0-source-gitignore/`: prepared source code (main/renderer) ready for pack
- `./pack-1-output-gitignore/`: packed Electron app

For develop, the step is like: (`npm run run-dev`)
- `npm run script-pack-0-source-dev`:
  - delete & recreate to reset `./pack-0-source-gitignore/` content
  - build code & output to: `./pack-0-source-gitignore/` (`npm run build-pack-0-source-dev`)
- run code with `electron ./pack-0-source-gitignore/main/index.js`

For Production/Release, the step is like: (`npm run run-prod`)
- `npm run script-pack-0-source`:
  - delete & recreate to reset `./pack-0-source-gitignore/` content
  - build code & output to: `./pack-0-source-gitignore/` (`npm run build-pack-0-source`)
  - better optimize output file with code minify & remove unused file
- `npm run script-pack-1-output`:
  - delete & recreate to reset `./pack-1-output-gitignore/` content
  - pack with `electron-packager` and output to `./pack-1-output-gitignore/`
  - copy `electron-color-picker` from `node_modules`, and put under output `resources/` folder
  - optionally delete unused platform code from copied `electron-color-picker`
