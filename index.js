'use strict';

const fs = require('fs')
const url = require('url')
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

function Elekid(componentPath, template) {
  function deleteFile(filepath) {
    try {
      fs.unlinkSync(filepath)
    } catch(e) {
      // console.log(e)
    }
  }

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

  const componentAbsolutePath = `${process.cwd()}/${componentPath}`
  DIRPATH = componentAbsolutePath.replace(/\/[^\/]+$/, '')

  __debug(DIRPATH, true)

  let transform = babel.transformFileSync(componentAbsolutePath, {
    presets: ['es2015-node', 'react'],
    ignore: /node_modules/,
  })

  transform = transform.code.replace('exports.default', 'module.exports')
  transform = `"use strict"; require = require('elekid').load; ${transform}`

  try {
    const app = requireFromString(transform)
    const App = react.createElement(app)
    const appString = reactDOMServer.renderToString(App)
    const body = template(appString)

    const indexPath = `${process.cwd()}/elekid.html`
    fs.writeFileSync(indexPath, body, 'utf-8')

    //do something when app is closing
    process.on('exit', deleteFile.bind(this, indexPath));
    //catches ctrl+c event
    process.on('SIGINT', deleteFile.bind(this, indexPath));
    //catches uncaught exceptions
    process.on('uncaughtException', deleteFile.bind(this, indexPath));

    return url.format({
      pathname: indexPath,
      protocol: 'file:',
      slashes: true
    })
  } catch(err) {
    __debug(err)
  }
}

// transfomer:
// const require = require('../index.js').load;
// require('./path/component.js');

exports.load = function load(path) {
  try {
    try {
      const dep = require(path)
      return dep
    } catch (err) {
      path = path.replace('./', '')
      path = `${DIRPATH}/${path}.js`

      __debug(path, true)

      let transform = babel.transformFileSync(path, {
        presets: ['es2015-node', 'react'],
        ignore: /node_modules/,
      })
      transform = transform.code.replace('exports.default', 'module.exports')
      transform = `"use strict"; require = require('elekid').load; ${transform}`
      const component = requireFromString(transform)
      return component
    }
  } catch (err) {
    __debug(err)
  }
}

exports.build = Elekid
