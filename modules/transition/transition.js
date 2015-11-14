/*jslint node: true */
var diff = require('../x-array/x-array'),
    prop = require('../prop/prop');


module.exports = function Transition(getter, transgetter) {
    'use strict';
    transgetter = prop(transgetter);
    var lastValue,
        diffspec = {
            id: function (obj) {return obj.key; },
            compareId: function (ida,  idb) { return ida.localeCompare(idb); },
            compareObj: function (obja, objb) {return obja.key.localeCompare(objb.key); },
            equality: function (report1, report2) { return transgetter(report1) === transgetter(report2); }
        };

    function listener() {
        var transitions = {};

        function begin() {}
        function end() { return transitions; }

        function push(statea, stateb, id) {
            if (!transitions[statea]) {
                transitions[statea] = {};
            }

            if (!transitions[statea][stateb]) {
                transitions[statea][stateb] = [];
            }
            transitions[statea][stateb].push(id);
        }

        function identical(id, oa, ob) {
            var state = transgetter(oa);
            push(state, state, id);
        }

        function modified(id, oa, ob) {
            push(transgetter(oa), transgetter(ob), id);
        }

        function added(id, o) {
            push('out', transgetter(o), id);
        }

        function removed(id, o) {
            push(transgetter(o), 'out', id);
        }

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
