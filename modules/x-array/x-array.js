/*jslint node: true */

function lister() {
    'use strict';
    var ids = [];
    return function (id) {
        if (id) {ids.push(id); }
        return ids;
    };
}

module.exports = function (config) {
    'use strict';
    var R = require('ramda'),
        id = config.id,                 // function that returns id from obj
        compareId   = config.compareId, // function that compares id
        compareObj  = config.compareObj || function (x, y) {return compareId(id(x), id(y)); }, // function that compares objects (array sorting)
        equality    = config.equality   || R.equals, // are objects with same identity, identical or modified ?
        fadded      = config.added      || lister,
        fremoved    = config.removed    || lister,
        fidentical  = config.identical  || lister,
        fmodified   = config.modified   || lister;

    function diffAB(araw, braw) {
        var added       = fadded(),
            removed     = fremoved(),
            identical   = fidentical(),
            modified    = fmodified(),
            a,          // sorted
            b,          // sorted
            alen,       // a.length
            blen,       // b.length
            aidx = 0,   // index of current a element
            bidx = 0,   // index of current b element
            aId,        // id of current a element
            bId,        // id of current b element
            cmp;        // comparison result of aId with bId

        if (!araw || !braw) {
            return {
                added:      added(),
                removed:    removed(),
                identical:  identical(),
                modified:   modified()
            };
        }

        a = R.sort(compareObj)(araw);
        b = R.sort(compareObj)(braw);
        alen = a.length;
        blen = b.length;

        while (aidx < alen && bidx < blen) {
            aId = id(a[aidx]);
            bId = id(b[bidx]);
            cmp = compareId(aId, bId);
            if (cmp === 0) {
                (equality(a[aidx], b[bidx]) ? identical : modified)(aId, a[aidx], b[bidx]);
                aidx += 1;
                bidx += 1;
            } else {
                if (cmp > 0) {
                    added(bId, undefined, b[bidx]);
                    bidx += 1;
                } else {
                    removed(aId, a[aidx], undefined);
                    aidx += 1;
                }
            }
        }

        while (aidx < alen) {
            aId = id(a[aidx]);
            removed(aId, a[aidx], undefined);
            aidx += 1;
        }

        while (bidx < blen) {
            bId = id(b[bidx]);
            added(bId, undefined, b[bidx]);
            bidx += 1;
        }

        return {
            added:      added(),
            removed:    removed(),
            identical:  identical(),
            modified:   modified()
        };
    }

    return diffAB;
};
