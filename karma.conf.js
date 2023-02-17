module.exports = function (config) {
    config.set({
        basePath: './',

        files: [
            './node_modules/babel-polyfill/dist/polyfill.js', // Polyfills from babel including core.js (for PhantomJS)
            './test/dist/environment-bundle.js',
            './test/**/*.test.js'
        ],

        autoWatch: true,

        logLevel: config.LOG_ERROR,
        // logLevel: config.LOG_DEBUG,

        frameworks: ['mocha', 'chai'],

        browsers: ['PhantomJS'],

        plugins: [
            'karma-phantomjs-launcher',
            'karma-mocha',
            'karma-chai',
            'karma-mocha-reporter'
        ],

        browserConsoleLogOptions: {
            level: 'log',
            format: '%b %T: %m',
            terminal: true
        },

        reporters: ['mocha'],

        proxies: {}
    });
};
