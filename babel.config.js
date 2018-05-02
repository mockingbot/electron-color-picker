const BABEL_ENV = process.env.BABEL_ENV || ''
const isDev = BABEL_ENV.includes('dev')

module.exports = {
  presets: [ [ '@babel/env', { targets: { node: 8 } } ] ],
  plugins: [
    [ '@babel/proposal-class-properties' ],
    [ 'module-resolver', { root: [ './' ], alias: { 'dr-js/module/(.+)': 'dr-js/library/' } } ],
    [ 'minify-replace', { replacements: [ { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value: isDev } } ] } ]
  ],
  comments: false
}
