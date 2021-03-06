import { resolve } from 'path'
import { writeFileSync } from 'fs'

import { collectSourceRouteMap } from '@dr-js/dev/module/node/export/parse'
import { generateExportInfo } from '@dr-js/dev/module/node/export/generate'
import { getMarkdownFileLink, renderMarkdownBlockQuote, renderMarkdownAutoAppendHeaderLink, renderMarkdownExportPath } from '@dr-js/dev/module/node/export/renderMarkdown'
import { runMain } from '@dr-js/dev/module/main'

import { engines, peerDependencies } from '../package.json'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

runMain(async (logger) => {
  logger.padLog('generate exportInfoMap')
  const sourceRouteMap = await collectSourceRouteMap({
    pathRootList: [ fromRoot('source') ],
    pathInfoFilter: ({ name }) => name !== 'index.example.js',
    logger
  })
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log('output: SPEC.md')
  writeFileSync(fromRoot('SPEC.md'), [
    '# Specification',
    '',
    ...renderMarkdownAutoAppendHeaderLink(
      '#### Export Path',
      ...renderMarkdownExportPath({ exportInfoMap, rootPath: PATH_ROOT }),
      '',
      '#### Package',
      getMarkdownFileLink('package.json'),
      ...renderMarkdownBlockQuote(JSON.stringify({ engines, peerDependencies }, null, 2))
    ),
    ''
  ].join('\n'))
}, 'generate-spec')
