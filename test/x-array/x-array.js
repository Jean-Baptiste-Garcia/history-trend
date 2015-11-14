/*jslint node: true*/
/*global describe: true, it: true */
'use strict';

var should = require('chai').should(),
    diff = require('../../modules/x-array/x-array-default'),
    spec = {
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
    diff(config, a, b).should.eql(negate(diff(config, b, a)));
}

describe('array-diff', function () {
    it('can compare nominal arrays', function () {
        var a = [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}],
            b = [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}],
            c = [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}];

        diff(spec, a, b).should.eql({added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']});
        shouldBeAntiSymetric(spec, neg, a, b);
        diff(spec, b, c).should.eql({added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']});
        shouldBeAntiSymetric(spec, neg, b, c);
    });

    it('is reflexive', function () {
        var a = [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}],
            b = [{ key: 'JIRA-783', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-100', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}];

        diff(spec, a, a).should.eql({added: [], removed: [], identical: ['JIRA-123', 'JIRA-456'], modified: []});
        diff(spec, b, b).should.eql({added: [], removed: [], identical: [ 'JIRA-100', 'JIRA-783', 'JIRA-789', 'JIRA-901'], modified: []});
    });

    it('works with empty arrays', function () {
        var a = [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}],
            b = [{ key: 'JIRA-783', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-100', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}];

        diff(spec, a, []).should.eql({added: [], removed: ['JIRA-123', 'JIRA-456'], identical: [], modified: []});
        shouldBeAntiSymetric(spec, neg, a, []);
        diff(spec, [], []).should.eql({added: [], removed: [], identical: [], modified: []});
    });


    it('should work with unsorted data', function () {
        var data = [
            [{ key: 'JIRA-456', status: 'In Progress'}, { key: 'JIRA-123', status: 'New'}],
            [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}],
            [{ key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-901', status: 'Done'}, { key: 'JIRA-789', status: 'Done'}]
        ];
        diff(spec, [], data[0]).should.eql({added: ['JIRA-123', 'JIRA-456'], removed: [], identical: [], modified: []});
        shouldBeAntiSymetric(spec, neg, [], data[0]);
        diff(spec, data[0], data[1]).should.eql({added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']});
        shouldBeAntiSymetric(spec, neg, data[0], data[1]);
        diff(spec, data[1], data[2]).should.eql({added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']});
        shouldBeAntiSymetric(spec, neg, data[1], data[2]);
        shouldBeAntiSymetric(spec, neg, data[0], data[2]);
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

        diff(config, a, b).should.eql({added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']});
        shouldBeAntiSymetric(config, neg, a, b);
        diff(config, b, c).should.eql({added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']});
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

        diff(config, a, b).should.eql({added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']});
        shouldBeAntiSymetric(config, neg, a, b);
        diff(config, b, c).should.eql({added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']});
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

        diff(config, a, b).should.eql({added: ['JIRA-789'], removed: ['JIRA-456'], identical: ['JIRA-123'], modified: []});
        shouldBeAntiSymetric(config, neg, a, b);
        diff(config, b, c).should.eql({added: ['JIRA-900', 'JIRA-901'], removed: [], identical: [], modified: ['JIRA-123', 'JIRA-789']});
        shouldBeAntiSymetric(config, neg, b, c);
    });

});
