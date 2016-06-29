var fs = require('fs')
  , path = require('path')
  //, should = require('should')
  //, mocha = require('mocha')
  ;

var normalizedPath = path.join(__dirname, 'specs');

fs.readdirSync(normalizedPath).forEach(function(file) {
  require('./specs/' + file);
});