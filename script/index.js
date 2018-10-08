import { resolve } from 'path'
import { execSync } from 'child_process'

import { binary as formatBinary } from 'dr-js/module/common/format'

import { argvFlag, runMain } from 'dev-dep-tool/module/main'
import { getLogger } from 'dev-dep-tool/module/logger'
import { getScriptFileListFromPathList } from 'dev-dep-tool/module/fileList'
import { initOutput, packOutput, publishOutput } from 'dev-dep-tool/module/commonOutput'
import { processFileList, fileProcessorBabel } from 'dev-dep-tool/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dev-dep-tool/module/minify'

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
  log(`size reduce: ${formatBinary(sizeReduce)}B`)

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, extraArgs: [ '--userconfig', '~/mockingbot.npmrc' ], logger })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
