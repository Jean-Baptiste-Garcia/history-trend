/*jslint node: true */
module.exports = function (optKey) {
    'use strict';
    var R = require('ramda'),
        idKey = optKey || 'key',

        id = function (x) {return x[idKey]; },
        sameId =  function (o1, o2) {return o1[idKey] === o2[idKey]; },
        idOnly = R.map(id),

        objectsInBothLists      = R.intersectionWith(sameId),
        identicalObjects        = R.intersectionWith(R.equals),
        objectsOnlyInFirstList  = R.differenceWith(sameId),

        objectsIdInBothLists        = R.compose(idOnly, objectsInBothLists),
        identicalObjectsId          = R.compose(idOnly, identicalObjects),
        objectsIdOnlyInFirstList    = R.compose(idOnly, objectsOnlyInFirstList),

        removed = objectsIdOnlyInFirstList,
        added   = R.flip(objectsIdOnlyInFirstList);


    function idSort(x, y) {return x[idKey].localeCompare(y[idKey]); }


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
            a,
            b,
            idA,
            idB,
            aidx = 0,
            bidx = 0,
            cmp;

        if (!araw) {
            // first comparison -- is meaningless -- all are considered as empty
            return diff;
        } // FIXME should be handled in flux. not here

        a = R.sort(idSort)(araw);
        b = R.sort(idSort)(braw);

        if (a.length !== 0 && b.length !== 0) {
            while (true) {
                idA = id(a[aidx]);
                idB = id(b[bidx]);
                cmp = idA.localeCompare(idB);
                if (cmp === 0) {
                    if (R.equals(a[aidx], b[bidx])) {
                        identical.push(idA);
                    } else {
                        modified.push(idA);
                    }
                    aidx += 1;
                    bidx += 1;
                } else {
                    if (cmp > 0) {
                        added.push(idB);
                        bidx += 1;
                    } else {
                        removed.push(idA);
                        aidx += 1;
                    }
                }
                if (aidx >= a.length || bidx >= b.length) { break; }
            }
        }


        if (aidx < a.length) {
            while (aidx < a.length) {
                idA = id(a[aidx]);
                removed.push(idA);
                aidx += 1;
            }
        }

        if (bidx < b.length) {
            while (bidx < b.length) {
                idB = id(b[bidx]);
                added.push(idB);
                bidx += 1;
            }
        }

        return diff;
    }

    return diffAB;
};
