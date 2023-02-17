(function () {
    'use strict';

    // Based on https://gist.github.com/jonbretman/7259628
    var type = function (o) {
        // handle corner cases for old IE and PhantomJS
        if (o === undefined) {
            return 'undefined';
        }

        if (o === null) {
            return 'null';
        }

        // handle DOM elements
        if (o && (o.nodeType === 1 || o.nodeType === 9)) {
            return 'element';
        }

        var s = Object.prototype.toString.call(o);
        var type = s.substring('[object '.length, s.length - 1).toLowerCase();

        // handle NaN and Infinity
        if (type === 'number') {
            if (isNaN(o)) {
                return 'nan';
            }
            if (!isFinite(o)) {
                return 'infinity';
            }
        }

        return type;
    };

    var types = [
        'Null',
        'Undefined',
        'Object',
        'Array',
        'String',
        'Number',
        'Boolean',
        'Function',
        'RegExp',
        'Element',
        'NaN',
        'Infinite',
        'Symbol'
    ];

    var generateMethod = function (t) {
        type['is' + t] = function (o) {
            return type(o) === t.toLowerCase();
        };
    };

    for (var i = 0; i < types.length; i++) {
        generateMethod(types[i]);
    }


    module.exports = type;
})();
