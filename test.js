const app = require('./bundle.js')
console.log(app)

const masamune = require('./index')
const template = (app) => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>Retro</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      <div id="root">${app}</div>
      <script async src="bundle.js"></script>
    </body>
  </html>`
}

masamune('app/index.js', template)
