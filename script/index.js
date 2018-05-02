import { resolve } from 'path'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dev-dep-tool/library/__utils__'
import { getLogger } from 'dev-dep-tool/library/logger'
import { wrapFileProcessor, fileProcessorBabel } from 'dev-dep-tool/library/fileProcessor'
import { initOutput, packOutput, publishOutput } from 'dev-dep-tool/library/commonOutput'
import { getUglifyESOption, minifyFileListWithUglifyEs } from 'dev-dep-tool/library/uglify'

import { binary as formatBinary } from 'dr-js/module/common/format'
import { getFileList } from 'dr-js/module/node/file/Directory'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore' ] : 'inherit', shell: true }

runMain(async (logger) => {
  const { padLog, log } = logger

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })

  padLog('generate export info')
  execSync(`npm run script-generate-spec`, execOptionRoot)

  if (!argvFlag('pack')) return

  padLog(`build output`)
  execSync('npm run build-library', execOptionRoot)

  padLog(`minify output`)
  await minifyFileListWithUglifyEs({
    fileList: (await getFileList(fromOutput('library'))).filter((path) => path.endsWith('.js') && !path.endsWith('.test.js')),
    option: getUglifyESOption({ isDevelopment: false, isModule: false }),
    rootPath: PATH_OUTPUT,
    logger
  })

  log(`process output`)
  let sizeCodeReduceModule = 0
  const processBabel = wrapFileProcessor({ processor: fileProcessorBabel, logger })
  for (const filePath of await getFileList(fromOutput('library'))) sizeCodeReduceModule += filePath.endsWith('.test.js') ? 0 : await processBabel(filePath)
  log(`size reduce: ${formatBinary(sizeCodeReduceModule)}B`)

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, extraArgs: [ '--userconfig', '~/mockingbot.npmrc' ], logger })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
