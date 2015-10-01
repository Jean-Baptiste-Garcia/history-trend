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


    function diff(a, b) {
        var identical;

        if (!a) {
            // first comparison -- all are considered as added
            return {added: idOnly(b), removed: [], identical: [], modified: []};
        }


        // When sorted
        //commona = R.sort(idSort, R.intersectionWith(sameId, a, b));
        //commonb = R.sort(idSort, R.intersectionWith(sameId, b, a));
        // identical = idOnly(R.intersectionWith(R.equals, commona, commonb)
        // modified: idOnly(R.differenceWith(R.equals, commona, commonb))


        // not sorted
        identical = identicalObjectsId(a, b);

        return {
            added:      added(a, b),
            removed:    removed(a, b),
            identical:  identical,
            modified:   R.difference(objectsIdInBothLists(a, b), identical)
        };
    }

    return diff;
};
