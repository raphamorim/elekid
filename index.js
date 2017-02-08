const fs = require('fs')
const babel = require('babel-core')
const react = require('react')
const requireFromString = require('require-from-string')
const reactDOMServer = require('react-dom/server')

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

  let transform

  console.log(`${process.cwd()}/${componentPath}`)
  transform = babel.transformFileSync(`${process.cwd()}/${componentPath}`, {
      presets: ['es2015-node'],
      ignore: /node_modules/,
      plugins: [
        'transform-react-jsx'
      ]
    })

  getRequires([], transform.ast.program.body).then((result) => {
    console.log(result)
    transform = transform.code.replace('exports.default', 'module.exports')
    console.log(transform)

    try {
      const app = requireFromString(transform)
      console.log(app)
      const App = react.createElement(app)
      console.log(reactDOMServer.renderToString(App))
    } catch(err) {
      console.log(err)
    }
  })
}

// const masamune_require = require('../index.js').req;
// replace `require()` by `masamune_require(__dirname, './atoms/piranho.js');`

exports.req = function masamuneRequire(dirname, dep) {
  dep = dep.replace('./', '')
  transform = babel.transformFileSync(`${dirname}/${dep}`, {
    presets: ['es2015-node'],
    ignore: /node_modules/,
    plugins: [
      'transform-react-jsx'
    ]
  })
  transform = transform.code.replace('exports.default', 'module.exports')
  const component = requireFromString(transform)
  console.log(component)
  return component
}

exports.build = Masamune