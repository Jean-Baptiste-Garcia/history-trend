/*jslint node: true */

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
    var fadded      = config.added      || lister,
        fremoved    = config.removed    || lister,
        fidentical  = config.identical  || lister,
        fmodified   = config.modified   || lister,
        added,
        removed,
        identical,
        modified,
        diff;

    function begin() {
        //console.log('begin');
        added       = fadded();
        removed     = fremoved();
        identical   = fidentical();
        modified    = fmodified();
    }

    function end() {
        //console.log('end');
        diff = {
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
        endComparison: end,
        value: function () {return diff; }
    };
}


module.exports = function (config) {
    'use strict';
    var R = require('ramda'),
        Diff = require('./x-array-raw'),
        id = config.id,                 // function that returns id from obj
        compareId   = config.compareId, // function that compares id
        compareObj  = config.compareObj || function (x, y) {return compareId(id(x), id(y)); }, // function that compares objects (array sorting)
        equality    = config.equality   || R.equals; // are objects with same identity, identical or modified ?


    function diffAB(araw, braw) {
        //console.log('diff', araw, braw);
        var listener = makelistener(config);
        config.listener = listener;
        new Diff(config)(araw, braw);
        return listener.value();
    }

    return diffAB;
};
