const fs = require('fs')
const url = require('url')

const assert = require('assert')
const elekid = require('../index')

const template = (app) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Template</title>
        <link rel="stylesheet" href="style.css">
      </head>
      <body>
        <div id="root">${app}</div>
        <script async src="bundle.js"></script>
      </body>
    </html>`
}
const renderedApp = '<section role="dialog" class="modal" data-reactroot="" data-reactid="1" data-react-checksum="-896964529"><input type="text" class="modal-search" id="modal-search" placeholder="Search for packages...." data-reactid="2"/><div class="modal-items" data-reactid="3"></div><section role="tabs" class="tabs" data-reactid="4"></section></section>'

process.env['ELEKID_DEBUG'] = true
process.env['DEBUG'] = true

describe('React Render', function () {
  context('Setting Template', function () {
    it('should get app rendered wrapped by template', function (done) {
      const result = elekid({
        path: 'test/fixtures/react/main.js',
        template: template,
        resolve: 'string'
      })

      assert.equal(typeof result, 'string')
      assert.equal(result, template(renderedApp))

      done()
    })
  })
  context('Without set template', function () {
    it('should get app rendered only', function (done) {
      const result = elekid({
        path: 'test/fixtures/react/main.js',
        resolve: 'string'
      })

      assert.equal(typeof result, 'string')
      assert.equal(result, renderedApp)

      done()
    })
  })
  context('Without set template', function () {
    it('should get app rendered only', function (done) {
      const result = elekid({
        path: 'test/fixtures/react/main.js',
        resolve: 'react'
      })

      assert.equal(typeof result, 'object')

      done()
    })
  })
  context('Check if create tmp file', function () {
    it('should have tmp file', function (done) {
      const result = elekid({
        path: 'test/fixtures/react/main.js',
        template: template
      })

      assert.equal(typeof result, 'string')
      assert.equal(result, url.format({
        pathname: `${process.cwd()}/elekid.html`,
        protocol: 'file:',
        slashes: true
      }))
      assert.equal(fs.readFileSync('./elekid.html').toString(), template(renderedApp))

      done()
    })
  })
})
