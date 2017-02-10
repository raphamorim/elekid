const fs = require('fs')
const babel = require('babel-core')
const react = require('react')
const requireFromString = require('require-from-string')
const reactDOMServer = require('react-dom/server')

let DIRPATH

const __debug = function debug(message, important) {
  if (process.env.DEBUG) {
    if (important)
      return console.log('\x1b[36m%s\x1b[0m', message)

    console.log(message)
  }
}

function Masamune(componentPath, template) {
  function getRequires(requires, body) {
    return new Promise((resolve) => {
    for (var i = 0; i < body.length; i++) {
      if (!body[i] || !body[i].type) return

      if (body[i].type === 'VariableDeclarator') {
        getRequires(requires, [body[i].init])
      }
      if (body[i].type === 'VariableDeclaration') {
        getRequires(requires, body[i].declarations)
      }
      if (body[i].type === 'ConditionalExpression') {
        getRequires(requires, [body[i].test, body[i].consequent])
      }
      if (body[i].type === 'AssignmentExpression') {
        getRequires(requires, [body[i].left, body[i].right])
      }
      if (body[i].type === 'ExpressionStatement') {
        if (body[i].expression.type === 'SequenceExpression')
          getRequires(requires, body[i].expression.expressions)

        getRequires(requires, [body[i].expression.left, body[i].expression.right])
      }
      if (body[i].type === 'FunctionDeclaration') {
        getRequires(requires, (body[i].body.body || []))
      }
      if (body[i].type === 'ImportDeclaration') {
        requires.push(body[i].source.value)
      }
      if (body[i].type === 'CallExpression') {
        if (body[i].callee.type === 'MemberExpression') {
          getRequires(requires, [body[i].callee.object])
        }

        if (body[i].callee.name === 'require') {
          requires.push(body[i].arguments[0].value)
        }
      }
    }
      resolve(requires)
    })
  }

  __debug(`${componentPath}`, true)
  __debug(`${process.cwd()}/${componentPath}`, true)

  const componentAbsolutePath = `${process.cwd()}/${componentPath}`
  DIRPATH = componentAbsolutePath.replace(/\/[^\/]+$/, '')

  let transform = babel.transformFileSync(componentAbsolutePath, {
      presets: ['es2015-node'],
      ignore: /node_modules/,
      plugins: [
        'transform-react-jsx'
      ]
    })
  transform = transform.code.replace('exports.default', 'module.exports')
  transform = `require = require('../index.js').load; ${transform}`

  try {
    const app = requireFromString(transform)
    const App = react.createElement(app)
    const appString = reactDOMServer.renderToString(App)
    return appString
  } catch(err) {
    __debug(err)
  }
}

// const require = require('../index.js').load;
// require('./atoms/piranho.js');`

exports.load = function load(path) {
  try {
    try {
      const dep = require(path)
      return dep
    } catch (err) {
      path = path.replace('./', '')
      path = `${DIRPATH}/${path}.js`
      __debug(path, true)

      transform = babel.transformFileSync(path, {
        presets: ['es2015-node'],
        ignore: /node_modules/,
        plugins: [
          'transform-react-jsx'
        ]
      })
      transform = transform.code.replace('exports.default', 'module.exports')
      const component = requireFromString(transform)
      return component
    }
  } catch (err) {
    __debug(err)
  }
}

exports.build = Masamune