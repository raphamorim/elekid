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
    // function run(ast) {
    //   console.log(ast.program.body)
    //   for (var i = 0; i < ast.program.body.length; i++) {
    //     console.log(ast.program.body[i])
    //   }
    // }

  console.log(`${process.cwd()}/${componentPath}`)
  transform = babel.transformFileSync(`${process.cwd()}/${componentPath}`, {
      presets: ['es2015-node'],
      plugins: [
        'transform-react-jsx'
      ]
    })
    // run(transform.ast)

  getRequires([], transform.ast.program.body).then((result) => {
    console.log(result)
    transform = transform.code.replace('exports.default', 'module.exports')
    console.log(transform)
    const App = react.createElement(requireFromString(transform))
    console.log(reactDOMServer.renderToString(App))
  })
}

module.exports = Masamune
