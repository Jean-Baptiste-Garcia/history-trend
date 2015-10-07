/**
* Construct a flux of arrays
* return {added:[a,b], removed:[], identical:[z], modified:[x]}
*/

/*jslint node: true */

var DiffArray = require('../x-array/x-array'),
    R = require('ramda');

module.exports = function FLux(getter, options) {
    'use strict';
    var option = options || {},
        transformation = R.merge({
            added: R.identity,
            removed: R.identity,
            modified: R.identity,
            identical: R.identity
        }, option),
        diff = new DiffArray(option.identification),
        lastValue;


    return function flux(report) {
        var currentValue = getter(report),
            fluxValue;

        fluxValue = diff(lastValue, currentValue);
        lastValue = currentValue;
        return R.evolve(transformation)(fluxValue);
    };

};