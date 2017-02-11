[![Coverage Status](https://coveralls.io/repos/github/raphamorim/elekid/badge.svg?branch=master)](https://coveralls.io/github/raphamorim/elekid?branch=master) [![Build Status](https://travis-ci.org/raphamorim/elekid.svg)](https://travis-ci.org/raphamorim/elekid) [![Join the chat at https://gitter.im/raphamorim/origami.js](https://badges.gitter.im/raphamorim/elekid)](https://gitter.im/raphamorim/elekid?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) 

# Elekid

> Electron Server Side Render

**tl;dr:** Promises to return all rendered components, regardless of whether it is ES2015 (es6), ES2016 or ES2017. Elekid works only with **React** (Soon: Inferno and Vuejs). Do you want add more support options? Send us a PR :)

```js
elekid('path/to/Component.js') // 
```

#### Can I use it for develop beyond Electron apps?

I strongly recommend: **NO**. Why? Elekid reads any code and parse/transpile it in runtime. It cost a lot, just imagine for every process, you will read/parse/transpile/tokenize/write.

#### Using config object instead path

```js
elekid({
  path: 'path/to/Component.js',
  template: (app) => `<html>${app}</html>`,
})
```

## Electron Usage

#### main.js

```js
const elekid = require('elekid')
const template = require('./template')

function createWindow() {
  let mainWindow = new BrowserWindow(config)

  mainWindow.loadURL(elekid({
    path: 'src/App.js', 
    template: template
  }))
  
  mainWindow.on('closed', function() {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}
```

#### template.js

```js
module.exports = (app) => {
  return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>My Template</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      <div id="root">${app}</div>
      <script async src="bundle.js"></script>
    </body>
  </html>`
```

## Roadmap

- [ ] Vuejs Support
- [ ] Inferno Support
- [ ] Add option to set filename and filepath
- [ ] Add option to return only rendered string
