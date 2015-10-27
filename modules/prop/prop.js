/*jslint node: true */

// returns a function to access value for given a path
// path like 'key1.key2.key3' --> obj[key1][key2][key3]

var R = require('ramda');
function togetter(path) {
    'use strict';
    var paths = path.split('.'),
        length = paths.length;

    switch (length) {
    case 0:
        throw 'bad path ' + path;
    case 1:
        return function (obj) { return obj[path]; };
    case 2:
        return function (obj) { return obj[paths[0]][paths[1]]; };
    default:
        return function (obj) {
            var index,
                o = obj;
            for (index = 0; index < length; index += 1) {
                o = o[paths[index]];
            }
            return o;
        };
    }
}

// returns last component of a path k1.k2.k3 --> k3
function lastPathComponent(path) {
    'use strict';
    var paths = path.split('.');
    return paths[paths.length - 1];
}

module.exports = function (object) {
    'use strict';
    if (typeof object === 'function') {
        return object;
    }
    var getter = togetter(object);
    getter.propertyname = object;
    getter.shortpropertyname = lastPathComponent(object);
    return getter;
};