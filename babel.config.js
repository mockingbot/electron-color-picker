const BABEL_ENV = process.env.BABEL_ENV || ''
const isDev = BABEL_ENV.includes('dev')

module.exports = {
  presets: [ [ '@babel/env', { targets: { node: '8.2.1' } } ] ],
  plugins: [
    [ 'minify-replace', { replacements: [ { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value: isDev } } ] } ],
    [ 'module-resolver', {
      root: [ './' ],
      alias: {
        'dev-dep-tool/module/(.+)': 'dev-dep-tool/library/',
        'dr-js/module/(.+)': 'dr-js/library/'
      }
    } ]
  ],
  comments: false
}
