/*jslint node: true */
var diff = require('../x-array/x-array'),
    prop = require('../prop/prop');


module.exports = function Transition(getter, spec) {
    'use strict';

    var transgetter = prop((typeof spec === 'string') ? spec : spec.transitionField),
        lastValue,
        diffspec = {
            id: function (obj) {return obj.key; },
            compareId: function (ida,  idb) { return ida.localeCompare(idb); },
            compareObj: function (obja, objb) {return obja.key.localeCompare(objb.key); },
            equality: function (report1, report2) { return transgetter(report1) === transgetter(report2); },
            filter: spec.filter
        };

    function listener() {
        var transitions = {},
            pusher;

        function begin() {}
        function end() { return transitions; }

        function listpusher(statea, stateb, id) {
            if (!transitions[statea]) {
                transitions[statea] = {};
            }

            if (!transitions[statea][stateb]) {
                transitions[statea][stateb] = [];
            }
            transitions[statea][stateb].push(id);
        }

        function countpusher(statea, stateb, id) {
            if (!transitions[statea]) {
                transitions[statea] = {};
            }

            if (!transitions[statea][stateb]) {
                transitions[statea][stateb] = 0;
            }
            transitions[statea][stateb] += 1;
        }

        function identical(id, oa, ob) {
            var state = transgetter(oa);
            pusher(state, state, id);
        }

        function modified(id, oa, ob) {
            pusher(transgetter(oa), transgetter(ob), id);
        }

        function added(id, o) {
            pusher('out', transgetter(o), id);
        }

        function removed(id, o) {
            pusher(transgetter(o), 'out', id);
        }

        pusher = spec.count  ? countpusher : listpusher;

        return {
            beginComparison: begin,
            identical: identical,
            modified: modified,
            added: added,
            removed: removed,
            endComparison: end
        };
    }

    return function transition(report) {
        var currentValue = getter(report),
            transitionValue = diff(diffspec, lastValue, currentValue, listener());
        lastValue = currentValue;
        return transitionValue;
    };
};
