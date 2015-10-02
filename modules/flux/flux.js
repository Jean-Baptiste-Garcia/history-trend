/**
* Construct a flux on objects or arrays
* return {added:[a,b], removed:[], identical:[z], modified:[x]}
*/

/*jslint node: true */

var DiffArray = require('../x-array/x-array'),
    DiffObject = require('../x-object/x-object');

module.exports = function FLux(getter, options) {
    'use strict';
    var diff,
        lastValue;

    return function flux(report) {
        var currentValue = getter(report),
            fluxValue;
        if (!diff) {
            diff =  (currentValue instanceof Array) ? new DiffArray(options[0]) : new DiffObject();
        }
        fluxValue = diff(lastValue, currentValue);
        lastValue = currentValue;
        return fluxValue;
    };

};