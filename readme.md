[![Coverage Status](https://coveralls.io/repos/github/raphamorim/elekid/badge.svg?branch=master)](https://coveralls.io/github/raphamorim/elekid?branch=master) [![Build Status](https://travis-ci.org/raphamorim/elekid.svg)](https://travis-ci.org/raphamorim/elekid) [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)

# Elekid

> Electron Server Side Render

**tl;dr:** Promises to return all rendered components, regardless of whether it is ES2015 (es6), ES2016 or ES2017. Elekid works only with **React** (Soon: Inferno and Vuejs). Do you want add more support options? Send us a PR :)

```js
elekid('path/to/Component.js')
```

#### How it works?

1. Read and transpile main component filepath, generating a node module
2. Every require in this node module is replaced by smart require (which transpile the source in runtime before nodejs parse start)
3. Parse'n deliver this module and repeat this it for every import/require missing.
4. Create a dynamic HTML file based on render result
5. When nodejs dispatch `exit`, `SIGINT` or `uncaughtException` event: delete `_.html`

#### Using config object instead path

```js
elekid({
  path: 'path/to/Component.js',
  template: (app) => `<html>${app}</html>`
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

#### Can I use it for develop beyond Electron apps?

I strongly recommend: **NO**.

Why? Elekid reads any code and parse/transpile it in runtime. It cost a lot, just imagine for every process, you will read/parse/transpile/tokenize/write.

## Roadmap

- [ ] Vuejs Support
- [ ] Inferno Support
- [ ] Add option to set filename and filepath
- [ ] Add option to return only rendered string

#### Who's using:

- [Retro Editor](https://github.com/raphamorim/retro)

If you're using, [let me know](https://github.com/raphamorim/elekid/issues/new) :)
