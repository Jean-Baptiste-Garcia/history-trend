/*jslint node: true */
module.exports = function (config) {
    'use strict';
    var R = require('ramda'),
        id = config.id,
        compareId = config.compareId,
        compareObj = config.compareObj || function (x, y) {return compareId(id(x), id(y)); };


    function diffAB(araw, braw) {
        var added = [],
            removed = [],
            identical = [],
            modified = [],
            diff = {
                added:      added,
                removed:    removed,
                identical:  identical,
                modified:  modified
            },
            a,          // sorted
            b,          // sorted
            alen,       // a.length
            blen,       // b.length
            aId,        // id of current a element
            bId,        // id of current b element
            aidx = 0,   // index of current a element
            bidx = 0,   // index of current b element
            cmp;        // comparison result of aId with bId

        if (!araw || !braw) {return diff; }

        a = R.sort(compareObj)(araw);
        b = R.sort(compareObj)(braw);
        alen = a.length;
        blen = b.length;

        if (alen !== 0 && blen !== 0) {
            while (true) {
                aId = id(a[aidx]);
                bId = id(b[bidx]);
                cmp = compareId(aId, bId);
                if (cmp === 0) {
                    (R.equals(a[aidx], b[bidx]) ? identical : modified).push(aId);
                    aidx += 1;
                    bidx += 1;
                } else {
                    if (cmp > 0) {
                        added.push(bId);
                        bidx += 1;
                    } else {
                        removed.push(aId);
                        aidx += 1;
                    }
                }
                if (aidx >= alen || bidx >= blen) { break; }
            }
        }

        while (aidx < alen) {
            aId = id(a[aidx]);
            removed.push(aId);
            aidx += 1;
        }

        while (bidx < blen) {
            bId = id(b[bidx]);
            added.push(bId);
            bidx += 1;
        }

        return diff;
    }

    return diffAB;
};
