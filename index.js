const fs = require('fs')
const babelify = require('babelify')
const browserify = require('browserify')
const react = require('react')
const requireFromString = require('require-from-string')
const reactDOMServer = require('react-dom/server')
const streams = require('memory-streams')

function Masamune(componentPath, template) {
  // return Promise((resolve, reject) => {

    var writer = new streams.WritableStream()

    console.log(`${process.cwd()}/${componentPath}`)
    browserify('./app/index.js')
      .transform('babelify', {
        ignore: /node_modules/,
        presets: ['es2015-node', 'react'],
        plugins: ['add-module-exports']
      })
      .bundle((err, buf) => {
        if (err) throw err

        let code = buf.toString()
        code = code.replace('exports.default', 'module.exports')
        fs.writeFileSync('bundle.js', code)
        const a = requireFromString(code)
        console.log(1, a)
        // console.log(code)
        // const App = react.createElement(requireFromString(code))
        // console.log(reactDOMServer.renderToString(App))
      })
      .pipe(fs.createWriteStream('bundle.js'))
  // })

}

module.exports = Masamune
