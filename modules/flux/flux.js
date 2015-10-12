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

function diffConfig(key) {
    return key ?
            {
                id: function (obj) {return obj[key]; },
                compareId: function (ida,  idb) { return ida.localeCompare(idb); },
                compareObj: function (obja, objb) {return obja[key].localeCompare(objb[key]); }
            } :
            defaultDiffConfig;
}

module.exports = function FLux(getter, options) {
    var option = options || {},
        transformation = R.merge(defaultTransformation, option),
        diff = new DiffArray(diffConfig(option.identification)),
        lastValue;

    return function flux(report) {
        var currentValue = getter(report),
            fluxValue;

        fluxValue = diff(lastValue, currentValue);
        lastValue = currentValue;
        return R.evolve(transformation)(fluxValue);
    };

};