/*
    List Comparator defined by a spec object :
        id          : function that returns identity from object to compare
        compareId   : function that compare object id
        [compareObj]: function to sort objects
        [equality]  : function that compares two objects with same identity

    Comparison events are sent to a listener that must implement these functions :
        beginComparison : called when comparison begins
        identical       : called when two objects are identical : id, objA, objB
        modified        : called when two objects are different : id, objA, objB
        added           : called when one object is added : id, obj
        removed         : called when one object is removed : id, obj
        endComparison   : called when comparison ends

*/

/*jslint node: true */

module.exports = function (spec, araw, braw, listener) {
    'use strict';
    var R = require('ramda'),
        id = spec.id,
        compareId   = spec.compareId,
        compareObj  = spec.compareObj || function (x, y) {return compareId(id(x), id(y)); },
        equality    = spec.equality   || R.equals,
        a,          // sorted
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
        return listener.endComparison();
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

    return listener.endComparison();
};
