#!/usr/bin/env node
require('shelljs/global');
var uglify = require('uglify-js');
var path = require('path');
resolve = path.resolve;

var conf;
if (test('-f', 'configure.json')) {
  conf = JSON.parse(cat('configure.json'));
} else {
  conf = {
    src: resolve(__dirname, '..', 'lge88-three.js'),
    dest: __dirname,
    targets: [
      {
        name: 'three.js',
        minify: false,
        includes: ['common', 'extras']
      },
      {
        name: 'three.min.js',
        minify: true,
        includes: ['common', 'extras']
      }
    ]
  }
}

if (!test('-d', conf.src)) {
  echo(conf.src + ' does not exist!');
  exit(1);
}

if (!test('-d', conf.dest)) {
  echo(conf.dest + ' does not exist!');
  exit(1);
}

var outro = [
  'if ( typeof module !== \'undefined\' ) {',
  '  module.exports = exports = THREE;',
  '}'
].join( '\n' );

conf.targets.forEach(function(target) {
  buildTarget(conf.src, conf.dest, target);
});

function buildTarget(src, dest, target) {
  var files = [];
  target.includes.forEach(function(inc) {
    files = files.concat(JSON.parse(cat(resolve('includes', inc) + '.json')));
  });

  // include Trackball controls
  files.push( "examples/js/controls/TrackballControls.js" );

  files = files.map(function(file) {
    return resolve(src, file);
  });

  var out = cat(files) + outro;

  if (!target.minify) {
    out.to(resolve(dest, target.name));
  } else {
    uglify.minify(out, { fromString: true }).code.to(resolve(dest, target.name));
  }
}



// exec('node build.js --include common --include extras --output ' + resolve(__dirname, 'three.js'));
// exec('node build.js --include common --include extras --minify --output ' + resolve(__dirname, 'three.min.js'));
