'use strict'

const fs = require('fs')
const url = require('url')
const babel = require('babel-core')
const react = require('react')
const isDirectory = require('is-directory')
const requireFromString = require('require-from-string')
const reactDOMServer = require('react-dom/server')

const babelConfig = {
  presets: [require('babel-preset-react'), require('babel-preset-flow'), 'es2015'],
  ignore: /node_modules/,
  plugins: [
    // used to comply to babel-preset-react-app
    require('babel-plugin-transform-class-properties'),
    // used to comply to babel-preset-react-app
    require('babel-plugin-transform-object-rest-spread'),
    // used to remove css imports
    [ require('babel-plugin-transform-require-ignore').default, { extensions: ['.css'] } ]
  ]
}

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
  if (process.env.DEBUG) {
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

  logger(`${componentPath}`, true)

  const componentAbsolutePath = `${process.cwd()}/${componentPath}`
  DIRPATH = componentAbsolutePath.replace(/\/[^\/]+$/, '') // eslint-disable-line

  logger(DIRPATH, true)

  let transform = babel.transformFileSync(componentAbsolutePath, babelConfig)

  transform = transform.code.replace('exports.default', 'module.exports')

  const pathElekid = (process.env.ELEKID_DEBUG) ? `${process.cwd()}/index.js` : 'elekid'
  transform = `"use strict"; require = require('${pathElekid}').load; ${transform}`

  try {
    const app = requireFromString(transform)
    if (resolve && resolve === 'module') {
      return app
    }

    const App = react.createElement(app)
    if (resolve && resolve === 'react') {
      return App
    }

    const appString = reactDOMServer.renderToString(App)
    const body = template(appString)
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
    return err
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

      let transform = babel.transformFileSync(path, babelConfig)

      transform = transform.code.replace('exports.default', 'module.exports')
      const pathElekid = (process.env.ELEKID_DEBUG) ? `${process.cwd()}/index.js` : 'elekid'
      transform = `"use strict"; require = require('${pathElekid}').load; ${transform}`
      const component = requireFromString(transform)
      return component
    }
  } catch (err) {
    logger(err)
    return err
  }
}

module.exports = extend(Elekid.bind(this), {load: load})
