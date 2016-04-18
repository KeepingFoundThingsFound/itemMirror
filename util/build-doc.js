'use strict'

var docdown = require('docdown')
var path = require('path')
var _ = require('lodash')
var fs = require('fs')

var pkg = require('../package.json')
var version = pkg.version
var readmePath = path.join(__dirname, '..', 'doc', 'README.md')

var config = {
  'base': {
    'entryLinks': [
      '<% if (name == "templateSettings" || !/^(?:methods|properties|seq)$/i.test(category)) {' +
      'print("[&#x24C3;](https://www.npmjs.com/package/lodash." + name.toLowerCase() + " \\"See the npm package\\")")' +
      '} %>'
    ],
    'path': path.join(__dirname, '..', 'scripts', 'ItemMirror.js'),
    'title': 'ItemMirror',
    'toc': 'categories',
    'url': 'https://github.com/KeepingFoundThingsFound/ItemMirror/blob/' + version + '/item-mirror.js'
  },
  'github': {
    'hash': 'github'
  },
  'site': {
    'tocLink': '#docs'
  }
}


function postprocess(string) {
  // Fix docdown bugs.
  return string
    // Repair the default value of `chars`.
    // See https://github.com/eslint/doctrine/issues/157 for more details.
    .replace(/\bchars=''/g, "chars=' '")
    // Wrap symbol property identifiers in brackets.
    .replace(/\.(Symbol\.(?:[a-z]+[A-Z]?)+)/g, '[$1]');
}

function onComplete(error) {
  if (error) {
    throw error;
  }
}

function build(type) {
  var options = _.defaults({}, config.base, config[type])
  var markdown = docdown(options)

  fs.writeFile(readmePath, postprocess(markdown), onComplete)
}

build(_.last(process.argv))
