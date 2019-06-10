import { resolve } from 'path'
import { execSync } from 'child_process'

import { modify } from 'dr-js/module/node/file/Modify'

import { getScriptFileListFromPathList } from 'dr-dev/module/node/fileList'
import { runMain, argvFlag } from 'dr-dev/module/main'
import { getTerserOption, minifyFileListWithTerser } from 'dr-dev/module/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../pack-0-source-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: 'inherit', shell: true }

runMain(async (logger) => {
  const { padLog } = logger

  padLog('reset output')
  await modify.delete(fromOutput())

  if (!argvFlag('dev')) {
    padLog('[PROD] babel source file to output, or just copy for test')
    execSync('npm run build-pack-0-source', execOptionRoot)

    padLog('[PROD] minify to for better reading')
    await minifyFileListWithTerser({
      fileList: await getScriptFileListFromPathList([ '' ], fromOutput),
      option: getTerserOption({ isReadable: true }),
      rootPath: PATH_OUTPUT,
      logger
    })
  } else {
    padLog('[DEV] babel source file to output, or just copy for test')
    execSync('npm run build-pack-0-source-dev', execOptionRoot)
  }

  padLog('copy "package.json"')
  await modify.copy(fromRoot('package.json'), fromOutput('package.json'))
}, 'pack-0-source')
