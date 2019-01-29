import { resolve } from 'path'
import { execSync } from 'child_process'

import { binary } from 'dr-js/module/common/format'

import { getScriptFileListFromPathList } from 'dr-dev/module/node/fileList'
import { runMain, argvFlag } from 'dr-dev/module/main'
import { initOutput, packOutput, publishOutput } from 'dr-dev/module/output'
import { processFileList, fileProcessorBabel } from 'dr-dev/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dr-dev/module/minify'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

runMain(async (logger) => {
  const { padLog, log } = logger

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  padLog('generate export info')
  execSync(`npm run script-generate-spec`, execOptionRoot)

  if (!argvFlag('pack')) return

  padLog(`build output`)
  execSync('npm run build-library', execOptionRoot)

  const fileList = await getScriptFileListFromPathList([ 'library' ], fromOutput)

  log(`process output`)
  let sizeReduce = 0
  sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption(), rootPath: PATH_OUTPUT, logger })
  sizeReduce += await processFileList({ fileList, processor: fileProcessorBabel, rootPath: PATH_OUTPUT, logger })
  log(`size reduce: ${binary(sizeReduce)}B`)

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, extraArgs: [ '--userconfig', '~/mockingbot.npmrc' ], logger })
})
