import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { runMain } from 'dev-dep-tool/module/main'
import { getLogger } from 'dev-dep-tool/module/logger'
import { collectSourceRouteMap } from 'dev-dep-tool/module/ExportIndex/parseExport'
import { generateExportInfo } from 'dev-dep-tool/module/ExportIndex/generateInfo'
import { autoAppendMarkdownHeaderLink, renderMarkdownExportPath, renderMarkdownFileLink } from 'dev-dep-tool/module/ExportIndex/renderMarkdown'

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
