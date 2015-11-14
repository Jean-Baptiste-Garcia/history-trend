/*jslint node: true */

module.exports = function (config) {
    'use strict';
    var R = require('ramda'),
        id = config.id,                 // function that returns id from obj
        compareId   = config.compareId, // function that compares id
        compareObj  = config.compareObj || function (x, y) {return compareId(id(x), id(y)); }, // function that compares objects (array sorting)
        equality    = config.equality   || R.equals, // are objects with same identity, identical or modified ?
        listener = config.listener;

    function diffAB(araw, braw) {
        //console.log('diff-raw', araw, braw);
        var a,          // sorted
            b,          // sorted
            alen,       // a.length
            blen,       // b.length
            aidx = 0,   // index of current a element
            bidx = 0,   // index of current b element
            aId,        // id of current a element
            bId,        // id of current b element
            cmp;        // comparison result of aId with bId

        listener.beginComparison();

        if (!araw || !braw) {
            listener.endComparison();
            return;
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
                (equality(a[aidx], b[bidx]) ? listener.identical : listener.modified)(aId, a[aidx], b[bidx]);
                aidx += 1;
                bidx += 1;
            } else {
                if (cmp > 0) {
                    listener.added(bId, b[bidx]);
                    bidx += 1;
                } else {
                    listener.removed(aId, a[aidx]);
                    aidx += 1;
                }
            }
        }

        while (aidx < alen) {
            aId = id(a[aidx]);
            listener.removed(aId, a[aidx]);
            aidx += 1;
        }

        while (bidx < blen) {
            bId = id(b[bidx]);
            listener.added(bId, b[bidx]);
            bidx += 1;
        }

        listener.endComparison();
    }

    return diffAB;
};
