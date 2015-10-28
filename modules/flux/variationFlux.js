/**
    Variation Flux : focus on variation of a number of quantity
    for each variation (in added / removed / modified), one get
    {key: k, from: v0, to: v1, variation: v1-v0}
*/
/*jslint node: true */
var Flux = require('./Flux'),
    U = require('./utils'),
    prop = require('../prop/prop');


module.exports = function VariationFlux(getter, vargetter) {
    'use strict';
    vargetter = prop(vargetter);
    return new Flux(getter, {
        equality: function (report1, report2) { return vargetter(report1) === vargetter(report2); },
        added: U.fluxVariation(vargetter),
        removed: U.fluxVariation(vargetter),
        modified: U.fluxVariation(vargetter),
        identical: U.fluxCounter
    });
};