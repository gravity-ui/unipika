module.exports = function (settings) {
    var format = require('./format');

    var unipika = {
        say: require('./say'),

        format: format.format,
        formatFromYSON: format.formatFromYSON,
        formatFromYQL: format.formatFromYQL,
        formatRaw: format.formatRaw,

        formatAttributes: format.formatAttributes,
        formatKey: format.formatKey,
        formatValue: format.formatValue,

        converters: {
            yson: require('./converters/yson-to-unipika'),
            yql: require('./converters/yql-to-unipika'),
            raw: require('./converters/raw-to-unipika')
        },
        utils: {
            format: require('./utils/format'),
            yson: require('./utils/yson'),
            utf8: require('./utils/utf8'),
            type: require('./utils/type')
        }
    };

    settings = settings || {};

    if (settings.exportBrowserModule) {
        if (typeof window === 'undefined') {
            return unipika;
        }

        // MODULES FOR BROWSERS
        var define,
            requirejsSupported = typeof window.define === 'function' && window.define.amd,
            ymodulesSupported = typeof window.modules === 'object';

        var provide = function (value) {
            return value;
        };

        var unify = function (code) {
            if (requirejsSupported) {
                return code.bind(null, provide);
            } else if (ymodulesSupported) {
                return code;
            } else {
                return code.bind(null, provide);
            }
        };

        if (requirejsSupported) {
            define = window.define;
        } else if (ymodulesSupported) {
            define = window.modules.define.bind(window.modules);
        } else {
            define = function (global, callback) {
                window[global] = callback();
            };
        }

        // For correct optimization RequereJS requires dependencies to be arrays of string literals,
        // also using named modules for compatibility
        // See docs http://requirejs.org/docs/optimization.html
        define('unipika', unify(function (provide) {
            'use strict';

            return provide(unipika);
        }));
    }

    return unipika;
};
