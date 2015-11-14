
/*
    base implementation of comparator listener
    listener collects comparison events and returns an object with added/removed/identical/modified
*/

/*jslint node: true */

var R = require('ramda'),
    diff = require('./x-array');

function accumulator() {
    'use strict';
    var ids = [];
    return function (id) {
        if (id) {ids.push(id); }
        return ids;
    };
}

function makelistener(spec) {
    'use strict';
    var added,
        removed,
        identical,
        modified,
        diff;

    function begin() {
        added       = (spec.added      || accumulator)();
        removed     = (spec.removed    || accumulator)();
        identical   = (spec.identical  || accumulator)();
        modified    = (spec.modified   || accumulator)();
    }

    function end() {
        return {
            added:      added(),
            removed:    removed(),
            identical:  identical(),
            modified:   modified()
        };
    }

    return {
        beginComparison: begin,
        identical: function (id, a, b) { return identical(id, a, b); },
        modified: function (id, a, b) { return modified(id, a, b); },
        added: function (id, obj) {added(id, undefined, obj); },
        removed: function (id, obj) {removed(id, obj, undefined); },
        endComparison: end
    };
}


module.exports = function (spec, araw, braw) {
    'use strict';
    return diff(spec, araw, braw, makelistener(spec));
};
