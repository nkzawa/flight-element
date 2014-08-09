module.exports = function(config) {
  'use strict';

  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      'bower_components/es5-shim/es5-shim.js',
      'bower_components/es5-shim/es5-sham.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/mocha-flight/lib/mocha-flight.js',
      'bower_components/expect/index.js',
      'node_modules/requirejs/require.js',
      'node_modules/karma-requirejs/lib/adapter.js',
      'test/index.js',
      {pattern: 'bower_components/**', included: false},
      {pattern: 'lib/*.js', included: false},
      {pattern: 'test/*.js', included: false}
    ],
    exclude: [],
    preprocessors: {},
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'Firefox'],
    singleRun: false
  });
};
