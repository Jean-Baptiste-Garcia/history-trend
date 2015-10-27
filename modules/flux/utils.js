/*jslint node: true */
'use strict';

var prop = require('../prop/prop');

exports.fluxCounter = function makecounter() {
    var count = 0;
    return function (id) {
        if (id) {count += 1; }
        return count;
    };
};

exports.fluxLister = function makeacc() {
    var ids = [];
    return function (id) {
        if (id) {ids.push(id); }
        return ids;
    };
};

exports.fluxVariation = function makevar(getter, variation) {
    getter = prop(getter);
    variation = variation || function (o1, o2) {
        return (o2 && o1) ? // modified
                getter(o2) - getter(o1) :
                o2 ? // added
                        getter(o2) :
                        o1 ? // removed
                                -getter(o1) :
                                0;
    };

    return function () {
        var vars = [];
        return function (id, o1, o2) {
            if (id) {
                vars.push({
                    key: id,
                    from: o1 ? getter(o1) : 0,
                    to: o2 ? getter(o2) : 0,
                    variation: variation(o1, o2)
                });
            }
            return vars;
        };
    };
};
