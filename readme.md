# Masamune

## main.js

```
const masamune = require('masamune')
const template = require('./template')

function createWindow() {
  let mainWindow = new BrowserWindow(config)

  mainWindow.loadURL(masamune('src/App.js', template))
```

## template.js

```
module.exports = (app) => {
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
```


Instead:

```
const url = require('url')

mainWindow.loadURL(url.format({
  pathname: path.join(__dirname, 'index.html'),
  protocol: 'file:',
  slashes: true
}))
```
