const BABEL_ENV = process.env.BABEL_ENV || ''
const isDev = BABEL_ENV.includes('dev')
const isModule = BABEL_ENV.includes('module')

module.exports = {
  presets: [ [ '@babel/env', { targets: { node: '8.2.1' } } ] ],
  plugins: [
    [ 'minify-replace', { replacements: [ { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value: isDev } } ] } ],
    [ 'module-resolver', {
      root: [ './' ],
      alias: isModule ? undefined : { '^dr-([\\w-]+)/module/(.+)': 'dr-\\1/library/\\2' }
    } ]
  ],
  comments: false
}
