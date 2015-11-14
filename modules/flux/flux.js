/**
* Construct a flux of arrays
* return {added:[a,b], removed:[], identical:[z], modified:[x]}
*/

/*jslint node: true */
'use strict';
var diff = require('../x-array/x-array'),
    R = require('ramda'),
    defaultDiffConfig = {
        id: function (obj) {return obj.key; },
        compareId: function (ida,  idb) { return ida.localeCompare(idb); },
        compareObj: function (obja, objb) {return obja.key.localeCompare(objb.key); }
    };

function diffConfig(options) {
    options = options || {};
    var key = options.identification,
        config = key ?
                {
                    id: function (obj) {return obj[key]; },
                    compareId: function (ida,  idb) { return ida.localeCompare(idb); },
                    compareObj: function (obja, objb) {return obja[key].localeCompare(objb[key]); }
                } :
                R.clone(defaultDiffConfig);

    config.equality = options.equality;
    config.added = options.added;
    config.removed = options.removed;
    config.identical = options.identical;
    config.modified = options.modified;
    return config;
}

module.exports = function Flux(getter, options) {
    var lastValue;

    return function flux(report) {
        var currentValue = getter(report),
            fluxValue;

        fluxValue = diff(lastValue, currentValue, diffConfig(options));
        lastValue = currentValue;
        return fluxValue;
    };
};

