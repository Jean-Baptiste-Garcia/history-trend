/**
* Construct a flux of arrays
* return {added:[a,b], removed:[], identical:[z], modified:[x]}
*/

/*jslint node: true */
'use strict';
var DiffArray = require('../x-array/x-array'),
    R = require('ramda'),
    defaultTransformation = {
        added: R.identity,
        removed: R.identity,
        modified: R.identity,
        identical: R.identity
    },
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
    return config;
}

module.exports = function FLux(getter, options) {
    var transformation = R.evolve(R.merge(defaultTransformation, options)),
        diff = new DiffArray(diffConfig(options)),
        lastValue;

    return function flux(report) {
        var currentValue = getter(report),
            fluxValue;

        fluxValue = diff(lastValue, currentValue);
        lastValue = currentValue;
        return transformation(fluxValue);
    };

};