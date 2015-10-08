/**
* compare two objects like maps (key,value)
* a = {k0:v0, k1:v1, k2:v2} b={k0:v0, k1:w1, k3:w3} -->
* {added: [k3], removed:[k2], identical[k0], modified[k1]}
*/

/*jslint node: true */


module.exports = function diff() {
    'use strict';
    var R = require('ramda');


    function diffObjects(a, b) {
        var akeys,
            bkeys,
            partition;

        function identicalObjects(key) { return R.equals(a[key], b[key]); }

        if (!a) {
            return {added: [], removed: [], identical: [], modified: []};
        }

        akeys = Object.keys(a);
        bkeys = Object.keys(b);

        partition = R.partition(identicalObjects, R.intersection(akeys, bkeys));

        return {
            added: R.difference(bkeys, akeys),
            removed: R.difference(akeys, bkeys),
            identical: partition[0],
            modified: partition[1]
        };
    }
    return diffObjects;
};
