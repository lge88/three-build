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
  files.push( "examples/js/controls/TrackballControls.js" );
  files.push( "examples/js/controls/EditorControls.js" );

  files = files.map(function(file) {
    return resolve(src, file);
  });

  var out = files
    .map( function( f ) {
      var re = /src\/renderers\/WebGLRenderer\.js/;
      if ( re.test( f ) ) {
        var out = cat( f );
        console.log( 'enableCameraInverseManualUpdate' );
        return enableCameraInverseManualUpdate( out );
      } else {
        return cat( f );
      }
    } )
    .join( '\n' );

  out = out + outro;

  if (!target.minify) {
    out.to(resolve(dest, target.name));
  } else {
    uglify.minify(out, { fromString: true }).code.to(resolve(dest, target.name));
  }
}

function addCommonJSSupport( out ) {
  return out + outro;
}

function enableCameraInverseManualUpdate( out ) {
  var pattern = /camera\.matrixWorldInverse\.getInverse\([ ]?camera\.matrixWorld[ ]?\)/g;

  return out.replace(
    pattern,
    '( ( camera.matrixWorldInverseAutoUpate === false ) ? camera.matrixWorldInverse : camera.matrixWorldInverse.getInverse( camera.matrixWorld ) )'
  );
}



// exec('node build.js --include common --include extras --output ' + resolve(__dirname, 'three.js'));
// exec('node build.js --include common --include extras --minify --output ' + resolve(__dirname, 'three.min.js'));
