'use strict'

const fs = require('fs')
const url = require('url')
const babel = require('babel-core')
const react = require('react')
const isDirectory = require('is-directory')
const requireFromString = require('require-from-string')
const reactDOMServer = require('react-dom/server')

let DIRPATH

const extend = function _extend (a, b, undefOnly) {
  for (var prop in b) {
    if (Object.prototype.hasOwnProperty.call(b, prop)) {
      if (prop !== 'constructor' || a !== global) {
        if (b[prop] === undefined) {
          delete a[prop]
        } else if (!(undefOnly && typeof a[prop] !== 'undefined')) {
          a[prop] = b[prop]
        }
      }
    }
  }
  return a
}

const logger = function _logger (message, important) {
  if (process.env.ELEKID_DEBUG) {
    if (important) {
      return console.log('\x1b[36m%s\x1b[0m', message)
    }

    console.log(message)
  }
}

function Elekid (config) {
  if (!config.path) {
    return false
  }

  const componentPath = config.path
  const template = config.template || ((app) => app)
  const resolve = config.resolve || false

  function deleteFile (filepath) {
    try {
      fs.unlinkSync(filepath)
    } catch (e) {
      // console.log(e)
    }
  }

  function getRequires (requires, body) { // eslint-disable-line
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
          if (body[i].expression.type === 'SequenceExpression') {
            getRequires(requires, body[i].expression.expressions)
          }

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

  logger(`${componentPath}`, true)

  const componentAbsolutePath = `${process.cwd()}/${componentPath}`
  DIRPATH = componentAbsolutePath.replace(/\/[^\/]+$/, '') // eslint-disable-line

  logger(DIRPATH, true)

  let transform = babel.transformFileSync(componentAbsolutePath, {
    presets: ['es2015-node', 'react'],
    ignore: /node_modules/
  })

  transform = transform.code.replace('exports.default', 'module.exports')

  const pathElekid = (process.env.ELEKID_DEBUG) ? `${process.cwd()}/index.js` : 'elekid'
  transform = `"use strict"; require = require('${pathElekid}').load; ${transform}`

  try {
    const app = requireFromString(transform)
    const App = react.createElement(app)
    const appString = reactDOMServer.renderToString(App)
    const body = template(appString)

    if (resolve && resolve === 'react') {
      return App
    }

    if (resolve && resolve === 'string') {
      return body
    }

    const indexPath = `${process.cwd()}/elekid.html`
    fs.writeFileSync(indexPath, body, 'utf-8')

    // do something when app is closing
    process.on('exit', deleteFile.bind(this, indexPath))
    // catches ctrl+c event
    process.on('SIGINT', deleteFile.bind(this, indexPath))
    // catches uncaught exceptions
    process.on('uncaughtException', deleteFile.bind(this, indexPath))

    return url.format({
      pathname: indexPath,
      protocol: 'file:',
      slashes: true
    })
  } catch (err) {
    logger(err)
  }
}

// transfom nodejs-require to require('elekid').load;
const load = function _load (path) {
  try {
    try {
      const dep = require(path)
      return dep
    } catch (err) {
      path = path.replace('./', '')
      path = `${DIRPATH}/${path}`

      if (isDirectory.sync(path)) {
        path = path + '/index.js'
      } else {
        path = path + '.js'
      }

      logger(path, true)

      let transform = babel.transformFileSync(path, {
        presets: ['es2015-node', 'react'],
        ignore: /node_modules/
      })
      transform = transform.code.replace('exports.default', 'module.exports')
      const pathElekid = (process.env.ELEKID_DEBUG) ? `${process.cwd()}/index.js` : 'elekid'
      transform = `"use strict"; require = require('${pathElekid}').load; ${transform}`
      const component = requireFromString(transform)
      return component
    }
  } catch (err) {
    logger(err)
  }
}

module.exports = extend(Elekid.bind(this), {load: load})
