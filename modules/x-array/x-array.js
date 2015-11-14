/*jslint node: true */

var R = require('ramda'),
    diff = require('./x-array-raw');

function lister() {
    'use strict';
    var ids = [];
    return function (id) {
        if (id) {ids.push(id); }
        return ids;
    };
}

function makelistener(config) {
    'use strict';
    var added,
        removed,
        identical,
        modified,
        diff;

    function begin() {
        added       = (config.added      || lister)();
        removed     = (config.removed    || lister)();
        identical   = (config.identical  || lister)();
        modified    = (config.modified   || lister)();
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
