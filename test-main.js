(function () {
    "use strict";

    // Tun on full stack traces in errors to help debugging
    Error.stackTraceLimit = Infinity;

    window.__karma__.loaded = function () { };

    System.config({
        baseURL: '/base/',
        defaultJSExtensions: true,
        paths: {
            'angular': 'node_modules/angular/angular.js',
            'angular-mocks': 'node_modules/angular-mocks/angular-mocks.js',
            'jasmine': "node_modules/jasmine-core/lib/jasmine-core.js",
            'app/plugins/sdk': 'sdk/query_ctrl.sdk.js'
        },
        packages: {
            dist: {
                defaultExtension: 'js',
            },
            sdk: {
                defaultExtension: 'js',
            },
        },
        meta: {
            'node_modules/angular/angular.js': {
                format: 'global',
                exports: 'angular',
            },
            'node_modules/angular-mocks/angular-mocks.js': {
                format: 'global',
                deps: ['angular'],
            },
        }
    });


    function file2moduleName(filePath) {
        return filePath.replace(/\\/g, '/')
            .replace(/^\/base\//, '')
            .replace(/\.\w*$/, '');
    }

    function isSpecFile(path) {
        return /\.spec\.(.*\.)?js$/.test(path);
    }

    function pluginFiles(path) {
        var isNPM = /\/node_modules\//.test(path);
        return /\/dist\//.test(path) && !isNPM;
    }

    var modules = Object.keys(window.__karma__.files)
        .filter(pluginFiles)
        .map(file2moduleName);

    var promises = modules.map(function (name) {
        console.log(name + '\n');
        return System.import(name);
    });

    Promise.all(promises)
        .then(function () {
            window.__karma__.start();
        }, function (error) {
            window.__karma__.error(error.stack || error);
        }).catch(function (error) {
            window.__karma__.error(error.stack || error);
        });

})();
