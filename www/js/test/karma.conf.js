// Karma configuration
// Generated on Wed Dec 30 2015 16:25:19 GMT-0500 (EST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'lib/modernizr.js',
      'lib/jquery.js',
      'lib/jquery.jplayer.js',
      'lib/bootstrap.js',
      'lib/underscore.js',
      'lib/ZeroClipboard.js',
      'lib/flickity.pkgd.js',
      'lib/getEmPixels.js',
      'lib/cookie.js',
      'lib/cross-storage-client.js',
      'lib/es6-promise.js',
      'app_config.js',
      'analytics.js',
      'audio.js',
      'app.js',
      '../../node_modules/jasmine-jquery/lib/jasmine-jquery.js',
      'test/spec/**/*spec.js',

      {
        pattern: 'data/*.json',
        watched: false,
        served: true,
        included: true
      }
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
