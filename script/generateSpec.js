import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { runMain } from 'dr-dev/module/main'
import { getLogger } from 'dr-dev/module/logger'
import { collectSourceRouteMap } from 'dr-dev/module/ExportIndex/parseExport'
import { generateExportInfo } from 'dr-dev/module/ExportIndex/generateInfo'
import { autoAppendMarkdownHeaderLink, renderMarkdownExportPath, renderMarkdownFileLink } from 'dr-dev/module/ExportIndex/renderMarkdown'

import { stringIndentLine } from 'dr-js/module/common/format'

import { engines, peerDependencies } from '../package.json'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const renderMarkdownPackage = () => [
  renderMarkdownFileLink('package.json'),
  '> ```',
  stringIndentLine(JSON.stringify({ engines, peerDependencies }, undefined, '  '), '> '),
  '> ```'
]

runMain(async (logger) => {
  logger.log(`collect sourceRouteMap`)
  const sourceRouteMap = await collectSourceRouteMap({
    pathRootList: [ fromRoot('source') ],
    pathInfoFilter: ({ name }) => name !== 'index.example.js',
    logger
  })

  logger.log(`generate exportInfo`)
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log(`output: SPEC.md`)
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...autoAppendMarkdownHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT }),
      '',
      '#### Package',
      ...renderMarkdownPackage()
    ),
    ''
  ].join('\n'))
}, getLogger('generate-export'))
