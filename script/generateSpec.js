import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { runMain } from 'dev-dep-tool/library/__utils__'
import { getLogger } from 'dev-dep-tool/library/logger'
import { createExportParser } from 'dev-dep-tool/library/ExportIndex/parseExport'
import { generateExportInfo } from 'dev-dep-tool/library/ExportIndex/generateInfo'
import { renderMarkdownExportPath, renderMarkdownFileLink } from 'dev-dep-tool/library/ExportIndex/renderMarkdown'

import { stringIndentLine } from 'dr-js/module/common/format'
import { getDirectoryInfoTree, walkDirectoryInfoTree } from 'dr-js/module/node/file/Directory'

import { engines, peerDependencies } from '../package.json'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const collectSourceRouteMap = async ({ logger }) => {
  const { parseExport, getSourceRouteMap } = createExportParser({ logger })
  await walkDirectoryInfoTree(await getDirectoryInfoTree(fromRoot('source')), ({ path, name }) => name !== 'index.example.js' && parseExport(path))
  return getSourceRouteMap()
}

const renderMarkdownPackage = () => [
  renderMarkdownFileLink('package.json'),
  '> ```',
  stringIndentLine(JSON.stringify({ engines, peerDependencies }, undefined, '  '), '> '),
  '> ```'
]

runMain(async (logger) => {
  logger.log(`collect sourceRouteMap`)
  const sourceRouteMap = await collectSourceRouteMap({ logger })

  logger.log(`generate exportInfo`)
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log(`output: SPEC.md`)
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    '* [Export Path](#export-path)',
    '* [Package](#package)',
    '',
    '#### Export Path',
    ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT }),
    '',
    '#### Package',
    ...renderMarkdownPackage(),
    ''
  ].join('\n'))
}, getLogger('generate-export'))
