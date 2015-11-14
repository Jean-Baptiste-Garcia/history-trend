/*jslint node: true*/
/*global describe: true, it: true */
'use strict';

var should = require('chai').should(),
    diff = require('../../modules/x-array/x-array'),
    keyDiff = {
        id: function (obj) {return obj.key; },
        compareId: function (ida,  idb) { return ida.localeCompare(idb); },
        compareObj: function (obja, objb) {return obja.key.localeCompare(objb.key); }
    };

function neg(diff) {
    return {
        added: diff.removed,
        removed: diff.added,
        modified: diff.modified,
        identical: diff.identical
    };
}

function shouldBeAntiSymetric(config, negate, a, b) {
    diff(a, b, config).should.eql(negate(diff(b, a, config)));
}


describe('array-diff', function () {
    it('can compare nominal arrays', function () {
        var a = [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}],
            b = [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}],
            c = [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}];

        diff(a, b, keyDiff).should.eql({added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']});
        shouldBeAntiSymetric(keyDiff, neg, a, b);
        diff(b, c, keyDiff).should.eql({added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']});
        shouldBeAntiSymetric(keyDiff, neg, b, c);
    });

    it('is reflexive', function () {
        var a = [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}],
            b = [{ key: 'JIRA-783', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-100', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}];

        diff(a, a, keyDiff).should.eql({added: [], removed: [], identical: ['JIRA-123', 'JIRA-456'], modified: []});
        diff(b, b, keyDiff).should.eql({added: [], removed: [], identical: [ 'JIRA-100', 'JIRA-783', 'JIRA-789', 'JIRA-901'], modified: []});
    });

    it('works with empty arrays', function () {
        var a = [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}],
            b = [{ key: 'JIRA-783', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-100', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}];

        diff(a, [], keyDiff).should.eql({added: [], removed: ['JIRA-123', 'JIRA-456'], identical: [], modified: []});
        shouldBeAntiSymetric(keyDiff, neg, a, []);
        diff([], [], keyDiff).should.eql({added: [], removed: [], identical: [], modified: []});
    });


    it('should work with unsorted data', function () {
        var data = [
            [{ key: 'JIRA-456', status: 'In Progress'}, { key: 'JIRA-123', status: 'New'}],
            [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}],
            [{ key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-901', status: 'Done'}, { key: 'JIRA-789', status: 'Done'}]
        ];
        diff([], data[0], keyDiff).should.eql({added: ['JIRA-123', 'JIRA-456'], removed: [], identical: [], modified: []});
        shouldBeAntiSymetric(keyDiff, neg, [], data[0]);
        diff(data[0], data[1], keyDiff).should.eql({added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']});
        shouldBeAntiSymetric(keyDiff, neg, data[0], data[1]);
        diff(data[1], data[2], keyDiff).should.eql({added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']});
        shouldBeAntiSymetric(keyDiff, neg, data[1], data[2]);
        shouldBeAntiSymetric(keyDiff, neg, data[0], data[2]);
    });
});

describe('array-diff with custom', function () {
    it('identity compares nominal arrays', function () {
        var a = [{ id: 'JIRA-123', status: 'New'}, { id: 'JIRA-456', status: 'In Progress'}],
            b = [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'In Progress'}],
            c = [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'Done'}, { id: 'JIRA-900', status: 'Done'}, { id: 'JIRA-901', status: 'Done'}],
            config = {
                id: function (obj) {return obj.id; },
                compareId: function (ida,  idb) { return ida.localeCompare(idb); },
                compareObj: function (obja, objb) {return obja.id.localeCompare(objb.id); }
            };

        diff(a, b, config).should.eql({added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']});
        shouldBeAntiSymetric(config, neg, a, b);
        diff(b, c, config).should.eql({added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']});
        shouldBeAntiSymetric(config, neg, b, c);
    });

    it('identity and default compareObj compares nominal arrays', function () {
        var a = [{ id: 'JIRA-123', status: 'New'}, { id: 'JIRA-456', status: 'In Progress'}],
            b = [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'In Progress'}],
            c = [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'Done'}, { id: 'JIRA-900', status: 'Done'}, { id: 'JIRA-901', status: 'Done'}],
            config = {
                id: function (obj) {return obj.id; },
                compareId: function (ida,  idb) { return ida.localeCompare(idb); }
            };

        diff(a, b, config).should.eql({added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']});
        shouldBeAntiSymetric(config, neg, a, b);
        diff(b, c, config).should.eql({added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']});
        shouldBeAntiSymetric(config, neg, b, c);
    });

    it('equality compares nominal arrays', function () {
        var a = [{ id: 'JIRA-123', remaining: 10, status: 'New'}, { id: 'JIRA-456', remaining: 50, status: 'In Progress'}],
            b = [{ id: 'JIRA-123', remaining: 10, status: 'In Progress'}, { id: 'JIRA-789', remaining: 10, status: 'In Progress'}],
            c = [{ id: 'JIRA-123', remaining: 20, status: 'In Progress'}, { id: 'JIRA-789', remaining: 20, status: 'Done'}, { id: 'JIRA-900', remaining: 50, status: 'Done'}, { id: 'JIRA-901', remaining: 50, status: 'Done'}],
            config = {
                id: function (obj) {return obj.id; },
                compareId: function (ida,  idb) { return ida.localeCompare(idb); },
                equality: function (a, b) { return a.remaining === b.remaining; }
            };

        diff(a, b, config).should.eql({added: ['JIRA-789'], removed: ['JIRA-456'], identical: ['JIRA-123'], modified: []});
        shouldBeAntiSymetric(config, neg, a, b);
        diff(b, c, config).should.eql({added: ['JIRA-900', 'JIRA-901'], removed: [], identical: [], modified: ['JIRA-123', 'JIRA-789']});
        shouldBeAntiSymetric(config, neg, b, c);
    });

});
