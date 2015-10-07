/**
* Construct a flux of objects
* return {added:[a,b], removed:[], identical:[z], modified:[x]}
*/

/*jslint node: true */

var DiffObject = require('../x-object/x-object'),
    R = require('ramda');

module.exports = function FLuxObj(getter, options) {
    'use strict';
    var diff = new DiffObject(),
        option = options || {},
        transformation = R.merge({
            added: R.identity,
            removed: R.identity,
            modified: R.identity,
            identical: R.identity
        }, option),
        lastValue;

    return function flux(report) {
        var currentValue = getter(report),
            fluxValue;

        fluxValue = diff(lastValue, currentValue);
        lastValue = currentValue;
        return R.evolve(transformation)(fluxValue);
    };

};