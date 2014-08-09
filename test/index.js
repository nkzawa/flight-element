(function() {
  'use strict';

  mocha.setup('mocha-flight');

  var tests = Object.keys(window.__karma__.files).filter(function(file) {
    return /^\/base\/test\/[^\/]+\.js$/i.test(file) && file !== '/base/test/index.js';
  }).map(function(path) {
    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
  });

  require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base',

    paths: {
      flight: 'bower_components/flight'
    },

    // dynamically load all test files
    deps: tests,

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
  });
})();
