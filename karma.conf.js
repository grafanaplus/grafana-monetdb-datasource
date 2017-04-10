module.exports = function (config) {
    'use strict';

    config.set({
        basePath: __dirname,

        frameworks: ["jasmine"],

        // list of files / patterns to load in the browser
        files: [
            'node_modules/es6-shim/es6-shim.js',
            'node_modules/systemjs/dist/system.src.js',
            'node_modules/angular/angular.js',
            'node_modules/angular-mocks/angular-mocks.js',
            './test-main.js',
            { pattern: "sdk/**/*.js", included: false },
            { pattern: "dist/**/*.js", included: false }
        ],

        // list of files to exclude
        exclude: [],

        reporters: ["dots"],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        captureTimeout: 20000,
        singleRun: true,
        autoWatchBatchDelay: 1000,
        browserNoActivityTimeout: 60000,
    });

};
