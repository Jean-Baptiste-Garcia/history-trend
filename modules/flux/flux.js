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
        option = options || {},
        transformation = R.merge({
            added: R.identity,
            removed: R.identity,
            modified: R.identity,
            identical: R.identity
        }, option);


    return function flux(report) {
        var currentValue = getter(report),
            fluxValue;
        if (!diff) {
            diff =  (currentValue instanceof Array) ? new DiffArray(option.identification) : new DiffObject();
        }
        fluxValue = diff(lastValue, currentValue);
        lastValue = currentValue;
        return R.evolve(transformation)(fluxValue);
    };

};