const fs = require('fs')
const babel = require('babel-core')
const react = require('react')
const requireFromString = require('require-from-string')
const reactDOMServer = require('react-dom/server')

function Masamune(componentPath, template) {
  console.log(`${process.cwd()}/${componentPath}`)
  let transform = babel.transformFileSync(`${process.cwd()}/${componentPath}`, {
    presets: ['es2015-node'],
    plugins: [
      'transform-react-jsx'
    ]
  })
  transform = transform.code.replace('exports.default', 'module.exports')
  console.log(transform)
  const App = react.createElement(requireFromString(transform))
  console.log(reactDOMServer.renderToString(App))
}

module.exports = Masamune
