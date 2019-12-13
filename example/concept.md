## concept

The idea of the example is to show a working Electron app project setup,
with all the code packed inside `app.asar`.

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
  - copy & edit `package.json` to `./pack-0-source-gitignore/`
  - run npm install in: `./pack-0-source-gitignore/` (`npm run step-pack-0-package-install`)
  - build code & output to: `./pack-0-source-gitignore/` (`npm run step-pack-0-build-source-dev`)
- run code with `electron ./pack-0-source-gitignore/main/index.js`

For Production/Release, the step is like: (`npm run run-prod`)
- `npm run script-pack-0-source`:
  - delete & recreate to reset `./pack-0-source-gitignore/` content
  - copy & edit `package.json` to `./pack-0-source-gitignore/`
  - run npm install in: `./pack-0-source-gitignore/` (`npm run step-pack-0-package-install`)
  - build code & output to: `./pack-0-source-gitignore/` (`npm run step-pack-0-build-source`)
  - better optimize output file with code minify & remove unused file
  - optionally delete unused platform code from copied `electron-color-picker`
- `npm run script-pack-1-output`:
  - delete & recreate to reset `./pack-1-output-gitignore/` content
  - pack with `electron-packager` and output to `./pack-1-output-gitignore/`
