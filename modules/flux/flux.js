/**
* Construct a flux on objects or arrays
* return {added:[a,b], removed:[], identical:[z], modified:[x]}
*/

/*jslint node: true */

var DiffArray = require('../x-array/x-array'),
    DiffObject = require('../x-object/x-object'),
    R = require('ramda');

module.exports = function FLux(getter, options) {
    'use strict';
    var diff,
        lastValue,
        config = { out: {
            added: R.identity,
            removed: R.identity,
            modified: R.identity,
            identical: R.identity
        }},
        option = options || {};

    config.identification = option.identification;
    config.out.added = option.added || config.out.added;
    config.out.removed = option.deleted || config.out.removed;
    config.out.modified = option.modified || config.out.modified;
    config.out.identical = option.identical || config.out.identical;

    return function flux(report) {
        var currentValue = getter(report),
            fluxValue;
        if (!diff) {
            diff =  (currentValue instanceof Array) ? new DiffArray(config.identification) : new DiffObject();
        }
        fluxValue = diff(lastValue, currentValue);
        lastValue = currentValue;
        return R.evolve(config.out)(fluxValue);
    };

};