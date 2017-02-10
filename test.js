// const app = require('./app')
// console.log(app)

const elekid = require('./index')
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

console.log(elekid.build('app/main.js', template))
