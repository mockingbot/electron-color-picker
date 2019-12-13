import { resolve } from 'path'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'

import { modifyDelete } from '@dr-js/core/module/node/file/Modify'

import { getScriptFileListFromPathList, resetDirectory } from '@dr-js/dev/module/node/file'
import { getTerserOption, minifyFileListWithTerser } from '@dr-js/dev/module/minify'
import { runMain, argvFlag } from '@dr-js/dev/module/main'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../pack-0-source-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execShell = (command) => execSync(command, { cwd: fromRoot(), stdio: 'inherit' })

runMain(async (logger) => {
  logger.padLog('reset output')
  await resetDirectory(fromOutput())

  logger.padLog('copy & edit "package.json"')
  const packageJSON = JSON.parse(String(readFileSync(fromRoot('package.json'))))
  delete packageJSON[ 'scripts' ]
  delete packageJSON[ 'devDependencies' ]
  writeFileSync(fromOutput('package.json'), JSON.stringify(packageJSON))

  logger.padLog('install package')
  execShell('npm run step-pack-0-package-install')

  if (argvFlag('dev')) {
    logger.padLog('[DEV] babel source file to output, or just copy for test')
    execShell('npm run step-pack-0-build-source-dev')
  } else {
    logger.padLog('[PROD] babel source file to output, or just copy for test')
    execShell('npm run step-pack-0-build-source')

    logger.padLog('[PROD] minify to for better reading')
    const fileList = await getScriptFileListFromPathList([ '' ], fromOutput)
    await minifyFileListWithTerser({ fileList, option: getTerserOption({ isReadable: true }), rootPath: PATH_OUTPUT, logger })

    logger.padLog('[PROD] trim extra platform from "electron-color-picker" (OPTIONAL)') // Optional, to make output package smaller
    process.platform !== 'win32' && await modifyDelete(fromOutput('node_modules/electron-color-picker/library/win32/'))
    process.platform !== 'linux' && await modifyDelete(fromOutput('node_modules/electron-color-picker/library/linux/'))
    process.platform !== 'darwin' && await modifyDelete(fromOutput('node_modules/electron-color-picker/library/darwin/'))
  }
}, 'pack-0-source')
