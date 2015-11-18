/*jslint node: true*/
/*global describe: true, it: true */
'use strict';

var should = require('chai').should(),
    assert = require('chai').assert,
    H = require('../index');

describe('history-trend', function () {
    describe('timeSerie', function () {
        it('works for array : h.f(k).fromArray(d)', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ];
            H.timeserie('sessionCount').fromArray(data).should.eql(data);
        });

        it('should only returns timeSerie fields', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}
            ];
            H.timeserie('sessionCount').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
            H.timeserie('schemasCount').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), schemasCount: 40}
            ]);
        });

        it('can be used twice', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}
            ],
                query = H.timeserie('sessionCount');
            query.fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
            query.fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);

        });

        it('can access nested object', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), status: {sessionCount: 100, schemasCount: 10}},
                { date: new Date('1995-12-18T03:24:00'), status: {sessionCount: 110, schemasCount: 20}},
                { date: new Date('1995-12-20T03:24:00'), status: {sessionCount: 120, schemasCount: 40}}

            ];
            H.timeserie('status.sessionCount').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
        });

        it('can access nested object (depth = 3)', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), status: { sessions: {sessionCount: 100}, schemasCount: 10}},
                { date: new Date('1995-12-18T03:24:00'), status: { sessions: {sessionCount: 110}, schemasCount: 20}},
                { date: new Date('1995-12-20T03:24:00'), status: { sessions: {sessionCount: 120}, schemasCount: 40}}

            ];
            H.timeserie('status.sessions.sessionCount').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
        });
    });

    describe('timeSerie with custom date field', function () {

        it('manages simple path h.f(k).fromArray(d, dk)', function () {
            var data = [
                { creationdate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { creationdate: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { creationdate: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ];
            H.timeserie('sessionCount').fromArray(data, 'creationdate').should.eql(data);
        });

        it('manages nested path h.f(k).fromArray(d, s.dk0)', function () {
            var data = [
                { status: {creationdate: new Date('1995-12-17T03:24:00')}, sessionCount: 100},
                { status: {creationdate: new Date('1995-12-18T03:24:00')}, sessionCount: 110},
                { status: {creationdate: new Date('1995-12-20T03:24:00')}, sessionCount: 120}
            ];
            H.timeserie('sessionCount').fromArray(data, 'status.creationdate').should.eql([
                { creationdate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { creationdate: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { creationdate: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
        });

        it('manages named date getter h.f(k).fromArray(d, getdate)', function () {
            var data = [
                { status: {creationdate: new Date('1995-12-17T03:24:00')}, sessionCount: 100},
                { status: {creationdate: new Date('1995-12-18T03:24:00')}, sessionCount: 110},
                { status: {creationdate: new Date('1995-12-20T03:24:00')}, sessionCount: 120}
            ],
                dateGetter = function reportdate(report) { return report.status.creationdate; };

            H.timeserie('sessionCount').fromArray(data, dateGetter).should.eql([
                { reportdate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { reportdate: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { reportdate: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
        });
        it('manages anonymous date getter h.f(k).fromArray(d, getdate)', function () {
            var data = [
                { status: {creationdate: new Date('1995-12-17T03:24:00')}, sessionCount: 100},
                { status: {creationdate: new Date('1995-12-18T03:24:00')}, sessionCount: 110},
                { status: {creationdate: new Date('1995-12-20T03:24:00')}, sessionCount: 120}
            ],
                dateGetter = function (report) { return report.status.creationdate; };

            H.timeserie('sessionCount').fromArray(data, dateGetter).should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
        });

        // TODO add date field that duplicates a report field (priority to date field or raise an error)
    });

    describe('timeserie with custom function h.f(g).fromArray(d)', function () {
        it('can count array length', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: ['user1', 'user2'], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: ['user3'], modified: ['user1']}}
            ],
                countadded = function (item) {
                    return item.schemas.added.length;
                };
            H.timeserie(countadded).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), value: 2},
                { date: new Date('1995-12-18T03:24:00'), value: 1},
                { date: new Date('1995-12-20T03:24:00'), value: 1}
            ]);
        });

        it('has custom function name when not anonymous', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}

            ],
                customfunction = function mult(item) {
                    return item.sessionCount * item.schemasCount;
                };

            H.timeserie(customfunction).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), mult: 100 * 10},
                { date: new Date('1995-12-18T03:24:00'), mult: 110 * 20},
                { date: new Date('1995-12-20T03:24:00'), mult: 120 * 40}
            ]);
        });

        it('work when chained h.f(g).f(k).fromArray(d)', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}

            ],
                customfunction = function (item) {
                    return item.sessionCount * item.schemasCount;
                };

            H.timeserie(customfunction).timeserie('schemasCount').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), value: 100 * 10, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), value: 110 * 20, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), value: 120 * 40, schemasCount: 40}
            ]);
        });


        it('works when chained with another custom function (both named) h.f(g).f(h).fromArray(d)', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}

            ],
                customfunction1 = function mult(item) {
                    return item.sessionCount * item.schemasCount;
                },
                customfunction2 = function sum(item) {
                    return item.sessionCount + item.schemasCount;
                };

            H.timeserie(customfunction1).timeserie(customfunction2).fromArray(data).should.eql(
                [
                    { date: new Date('1995-12-17T03:24:00'), mult: 100 * 10, sum: 100 + 10},
                    { date: new Date('1995-12-18T03:24:00'), mult: 110 * 20, sum: 110 + 20},
                    { date: new Date('1995-12-20T03:24:00'), mult: 120 * 40, sum: 120 + 40}
                ]
            );
        });

        it('works when chained with another custom function (both anonymous) h.f(g).f(h).fromArray(d)', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}

            ],
                customfunction1 = function (item) {
                    return item.sessionCount * item.schemasCount;
                },
                customfunction2 = function (item) {
                    return item.sessionCount + item.schemasCount;
                };

            H.timeserie(customfunction1).timeserie(customfunction2).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), value1: 100 * 10, value2: 100 + 10},
                { date: new Date('1995-12-18T03:24:00'), value1: 110 * 20, value2: 110 + 20},
                { date: new Date('1995-12-20T03:24:00'), value1: 120 * 40, value2: 120 + 40}
            ]);
        });
    });

    describe('flux on object h.f(k).fromArray(d)', function () {
        it('should work on simple data', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), schemas: { user1: ['a'], user2: ['b'] }},
                { date: new Date('1995-12-18T03:24:00'), schemas: { user1: ['a'], user3: ['c'] }},
                { date: new Date('1995-12-20T03:24:00'), schemas: { user1: ['b'], user2: ['b'], user3: ['c'] }}
            ];

            H.fluxObj('schemas').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: [], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: ['user3'], modified: ['user1']}}
            ]);
        });

        it('should work on nested objects for equality (deepEqual)', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), schemas: { user1: ['a', { name: 'hello', gloup: 'glop'}], user2: ['b'] }},
                { date: new Date('1995-12-18T03:24:00'), schemas: { user1: ['a', { name: 'hello', gloup: 'glop'}], user3: ['c'] }},
                { date: new Date('1995-12-20T03:24:00'), schemas: { user1: ['a', { name: 'hello', gloup: 'glup'}], user2: ['b'], user3: ['c', {msg: 'diff'}] }}
            ];

            H.fluxObj('schemas').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: [], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: [], modified: ['user1', 'user3']}}
            ]);
        });

        it('should work on nested object', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), status : {schemas: { user1: ['a'], user2: ['b'] }}},
                { date: new Date('1995-12-18T03:24:00'), status : {schemas: { user1: ['a'], user3: ['c'] }}},
                { date: new Date('1995-12-20T03:24:00'), status : {schemas: { user1: ['b'], user2: ['b'], user3: ['c'] }}}
            ];

            H.fluxObj('status.schemas').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: [], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: ['user3'], modified: ['user1']}}
            ]);
        });

        it('should work on nested object using H.prop', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), status : {schemas: { user1: ['a'], user2: ['b'] }}},
                { date: new Date('1995-12-18T03:24:00'), status : {schemas: { user1: ['a'], user3: ['c'] }}},
                { date: new Date('1995-12-20T03:24:00'), status : {schemas: { user1: ['b'], user2: ['b'], user3: ['c'] }}}
            ];

            H.fluxObj(H.prop('status.schemas')).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: [], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: ['user3'], modified: ['user1']}}
            ]);
        });

        it('should work with custom function', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), status : {schemas: { user1: ['a'], user2: ['b'] }}},
                { date: new Date('1995-12-18T03:24:00'), status : {schemas: { user1: ['a'], user3: ['c'] }}},
                { date: new Date('1995-12-20T03:24:00'), status : {schemas: { user1: ['b'], user2: ['b'], user3: ['c'] }}}
            ];

            function schemas(report) {return report.status.schemas; }

            H.fluxObj(schemas).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: [], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: ['user3'], modified: ['user1']}}
            ]);
        });
    });

    // TODO add tests on non existing properties

    describe('flux on array h.f(k).fromArray(d)', function () {
        it('should work on nominal data', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}]}
            ];

            H.flux('issues').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: [], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']}},
                { date: new Date('1995-12-20T03:24:00'), issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']}}
            ]);
        });

        it('should work on nominal data with H.prop', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}]}
            ];

            H.flux(H.prop('issues')).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: [], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']}},
                { date: new Date('1995-12-20T03:24:00'), issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']}}
            ]);
        });

        it('should work on unsorted data', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ key: 'JIRA-456', status: 'In Progress'}, { key: 'JIRA-123', status: 'New'}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-901', status: 'Done'}, { key: 'JIRA-789', status: 'Done'}]}
            ];

            H.flux('issues').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: [], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']}},
                { date: new Date('1995-12-20T03:24:00'), issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']}}
            ]);
        });

        it('should work with custom identity', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ id: 'JIRA-123', status: 'New'}, { id: 'JIRA-456', status: 'In Progress'}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'In Progress'}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'Done'}, { id: 'JIRA-900', status: 'Done'}, { id: 'JIRA-901', status: 'Done'}]}
            ];

            H.flux('issues', {identification: 'id'}).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: [], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']}},
                { date: new Date('1995-12-20T03:24:00'), issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']}}
            ]);
        });

        it('should work with identical & modified counter', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}]}
            ];

            H.flux('issues', {
                identical: H.fluxCounter,
                modified:  H.fluxCounter
            }).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: [], removed: [], identical: 0, modified: 0}},
                { date: new Date('1995-12-18T03:24:00'), issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: 0, modified: 1}},
                { date: new Date('1995-12-20T03:24:00'), issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: 1, modified: 1}}
            ]);
        });

        it('should work with custom identity and identical & modified counter', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ id: 'JIRA-123', status: 'New'}, { id: 'JIRA-456', status: 'In Progress'}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'In Progress'}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'Done'}, { id: 'JIRA-900', status: 'Done'}, { id: 'JIRA-901', status: 'Done'}]}
            ];

            H.flux('issues', {
                identification: 'id',
                identical: H.fluxCounter,
                modified: H.fluxCounter
            }).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: [], removed: [], identical: 0, modified: 0}},
                { date: new Date('1995-12-18T03:24:00'), issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: 0, modified: 1}},
                { date: new Date('1995-12-20T03:24:00'), issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: 1, modified: 1}}
            ]);
        });

        it('should work with custom equality', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New', remaining: 10}, { key: 'JIRA-456', status: 'In Progress', remaining: 100}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', remaining: 10}, { key: 'JIRA-789', status: 'In Progress', remaining: 20}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', remaining: 5}, { key: 'JIRA-789', status: 'Done', remaining: 0}, { key: 'JIRA-900', status: 'Done', remaining: 0}, { key: 'JIRA-901', status: 'Done', remaining: 0}]}
            ];

            H.flux('issues', {
                equality: function (report1, report2) { return report1.remaining === report2.remaining; }
            }).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: [], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: ['JIRA-123'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: [], modified: ['JIRA-123', 'JIRA-789']}}
            ]);
        });

        it('should work with custom equality and variations', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New', remaining: 10}, { key: 'JIRA-456', status: 'In Progress', remaining: 100}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', remaining: 10}, { key: 'JIRA-789', status: 'In Progress', remaining: 20}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', remaining: 5}, { key: 'JIRA-789', status: 'Done', remaining: 0}, { key: 'JIRA-900', status: 'Done', remaining: 0}, { key: 'JIRA-901', status: 'Done', remaining: 0}]}
            ];

            H.flux('issues', {
                equality: function (report1, report2) { return report1.remaining === report2.remaining; },
                added: H.fluxVariation('remaining'),
                removed: H.fluxVariation(H.prop('remaining')),
                modified: H.fluxVariation(H.prop('remaining')),
                identical: H.fluxCounter
            }).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: [], removed: [], identical: 0, modified: []}},
                { date: new Date('1995-12-18T03:24:00'), issues: {
                    added: [{key: 'JIRA-789', from: 0, to: 20, variation: 20}],
                    removed: [{key: 'JIRA-456', from: 100, to: 0, variation: -100}],
                    identical: 1,
                    modified: []
                }},
                { date: new Date('1995-12-20T03:24:00'), issues: {
                    added: [{key: 'JIRA-900', from: 0, to: 0, variation: 0},
                            {key: 'JIRA-901', from: 0, to: 0, variation: 0}],
                    removed: [],
                    identical: 0,
                    modified: [{key: 'JIRA-123', from: 10, to: 5, variation: -5},
                               {key: 'JIRA-789', from: 20, to: 0, variation: -20}]
                }}
            ]);
        });
    });

    describe('variation flux on array', function () {
        it('should work with number quantity', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New', remaining: 10}, { key: 'JIRA-456', status: 'In Progress', remaining: 100}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', remaining: 10}, { key: 'JIRA-789', status: 'In Progress', remaining: 20}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', remaining: 5}, { key: 'JIRA-789', status: 'Done', remaining: 0}, { key: 'JIRA-900', status: 'Done', remaining: 0}, { key: 'JIRA-901', status: 'Done', remaining: 0}]}
            ];

            H.variationFlux('issues', 'remaining').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: [], removed: [], identical: 0, modified: []}},
                { date: new Date('1995-12-18T03:24:00'), issues: {
                    added: [{key: 'JIRA-789', from: 0, to: 20, variation: 20}],
                    removed: [{key: 'JIRA-456', from: 100, to: 0, variation: -100}],
                    identical: 1,
                    modified: []
                }},
                { date: new Date('1995-12-20T03:24:00'), issues: {
                    added: [{key: 'JIRA-900', from: 0, to: 0, variation: 0},
                            {key: 'JIRA-901', from: 0, to: 0, variation: 0}],
                    removed: [],
                    identical: 0,
                    modified: [{key: 'JIRA-123', from: 10, to: 5, variation: -5},
                               {key: 'JIRA-789', from: 20, to: 0, variation: -20}]
                }}
            ]);
        });
    });

    describe('transition flux on array', function () {
        it('should work with status change', function () {
            var data = [
                {date: new Date('1995-12-17T03:24:00'), issues: [
                    //identical
                    {key: 'JIRA-100', status: 'New'},
                    {key: 'JIRA-101', status: 'In Progress'},
                    {key: 'JIRA-102', status: 'Done'},
                    //removed
                    {key: 'JIRA-200', status: 'New'},
                    {key: 'JIRA-201', status: 'In Progress'},
                    {key: 'JIRA-202', status: 'Done'},
                    //modified
                    {key: 'JIRA-400', status: 'New'},
                    {key: 'JIRA-401', status: 'In Progress'},
                    {key: 'JIRA-402', status: 'Done'},
                    {key: 'JIRA-403', status: 'New'},
                    // misc
                    {key: 'JIRA-500', status: 'New'}
                ]},
                {date: new Date('1995-12-18T03:24:00'), issues: [
                    // identical
                    {key: 'JIRA-100', status: 'New'},
                    {key: 'JIRA-101', status: 'In Progress'},
                    {key: 'JIRA-102', status: 'Done'},
                    // added
                    {key: 'JIRA-300', status: 'New'},
                    {key: 'JIRA-301', status: 'In Progress'},
                    {key: 'JIRA-302', status: 'Done'},
                    //modified
                    {key: 'JIRA-400', status: 'In Progress'},
                    {key: 'JIRA-401', status: 'Done'},
                    {key: 'JIRA-402', status: 'New'},
                    {key: 'JIRA-403', status: 'Done'},
                    // misc
                    {key: 'JIRA-500', status: 'In Progress'}
                ]}
            ];

            H.transition('issues', 'status').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {}},
                { date: new Date('1995-12-18T03:24:00'), issues: {
                    New: {
                        New: ['JIRA-100'],
                        out: ['JIRA-200'],
                        'In Progress': ['JIRA-400', 'JIRA-500'],
                        Done: ['JIRA-403']
                    },
                    'In Progress': {
                        'In Progress': ['JIRA-101'],
                        out: ['JIRA-201'],
                        Done: ['JIRA-401']
                    },
                    'Done': {
                        Done: ['JIRA-102'],
                        out: ['JIRA-202'],
                        New: ['JIRA-402']
                    },
                    'out': {
                        New: ['JIRA-300'],
                        'In Progress': ['JIRA-301'],
                        Done: ['JIRA-302']
                    }
                }}
            ]);
        });

        it('should work when only counting', function () {
            var data = [
                {date: new Date('1995-12-17T03:24:00'), issues: [
                    //identical
                    //{key: 'JIRA-100', status: 'New'},
                    {key: 'JIRA-101', status: 'In Progress'},
                    {key: 'JIRA-102', status: 'Done'},
                    //removed
                    {key: 'JIRA-200', status: 'New'},
                    {key: 'JIRA-201', status: 'In Progress'},
                    {key: 'JIRA-202', status: 'Done'},
                    //modified
                    {key: 'JIRA-400', status: 'New'},
                    {key: 'JIRA-401', status: 'In Progress'},
                    {key: 'JIRA-402', status: 'Done'},
                    {key: 'JIRA-403', status: 'New'},
                    // misc
                    {key: 'JIRA-500', status: 'New'}
                ]},
                {date: new Date('1995-12-18T03:24:00'), issues: [
                    // identical
                    //{key: 'JIRA-100', status: 'New'},
                    {key: 'JIRA-101', status: 'In Progress'},
                    {key: 'JIRA-102', status: 'Done'},
                    // added
                    {key: 'JIRA-300', status: 'New'},
                    {key: 'JIRA-301', status: 'In Progress'},
                    {key: 'JIRA-302', status: 'Done'},
                    //modified
                    {key: 'JIRA-400', status: 'In Progress'},
                    {key: 'JIRA-401', status: 'Done'},
                    {key: 'JIRA-402', status: 'New'},
                    {key: 'JIRA-403', status: 'Done'},
                    // misc
                    {key: 'JIRA-500', status: 'In Progress'}
                ]}
            ];

            H.transition('issues', {
                transitionField: 'status',
                count: true
            }).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {}},
                { date: new Date('1995-12-18T03:24:00'), issues: {
                    New: {
                        //New: 0,
                        out: 1,
                        'In Progress': 2,
                        Done: 1
                    },
                    'In Progress': {
                        'In Progress': 1,
                        out: 1,
                        Done: 1
                    },
                    'Done': {
                        Done: 1,
                        out: 1,
                        New: 1
                    },
                    'out': {
                        New: 1,
                        'In Progress': 1,
                        Done: 1
                    }
                }}
            ]);
        });

        it('should work with custom filter', function () {
            var data = [
                {date: new Date('1995-12-17T03:24:00'), issues: [
                    //identical
                    {key: 'JIRA-100', status: 'New', type: 'Bug'},
                    {key: 'JIRA-101', status: 'In Progress', type: 'Bug'},
                    {key: 'JIRA-102', status: 'Done', type: 'Bug'},
                    //removed
                    {key: 'JIRA-200', status: 'New', type: 'Bug'},
                    {key: 'JIRA-201', status: 'In Progress', type: 'Bug'},
                    {key: 'JIRA-202', status: 'Done', type: 'Bug'},
                    //modified
                    {key: 'JIRA-400', status: 'New', type: 'Bug'},
                    {key: 'JIRA-401', status: 'In Progress', type: 'Bug'},
                    {key: 'JIRA-402', status: 'Done', type: 'Bug'},
                    {key: 'JIRA-403', status: 'New', type: 'Bug'},
                    // misc
                    {key: 'JIRA-500', status: 'New', type: 'Bug'},
                                        //identical
                    {key: 'JIRF-100', status: 'New', type: 'Feature'},
                    {key: 'JIRF-101', status: 'In Progress', type: 'Feature'},
                    {key: 'JIRF-102', status: 'Done', type: 'Feature'},
                    //removed
                    {key: 'JIRF-200', status: 'New', type: 'Feature'},
                    {key: 'JIRF-201', status: 'In Progress', type: 'Feature'},
                    {key: 'JIRF-202', status: 'Done', type: 'Feature'},
                    //modified
                    {key: 'JIRF-400', status: 'New', type: 'Feature'},
                    {key: 'JIRF-401', status: 'In Progress', type: 'Feature'},
                    {key: 'JIRF-402', status: 'Done', type: 'Feature'},
                    {key: 'JIRF-403', status: 'New', type: 'Feature'},
                    // misc
                    {key: 'JIRF-500', status: 'New', type: 'Feature'}
                ]},
                {date: new Date('1995-12-18T03:24:00'), issues: [
                    // identical
                    {key: 'JIRA-100', status: 'New', type: 'Bug'},
                    {key: 'JIRA-101', status: 'In Progress', type: 'Bug'},
                    {key: 'JIRA-102', status: 'Done', type: 'Bug'},
                    // added
                    {key: 'JIRA-300', status: 'New', type: 'Bug'},
                    {key: 'JIRA-301', status: 'In Progress', type: 'Bug'},
                    {key: 'JIRA-302', status: 'Done', type: 'Bug'},
                    //modified
                    {key: 'JIRA-400', status: 'In Progress', type: 'Bug'},
                    {key: 'JIRA-401', status: 'Done', type: 'Bug'},
                    {key: 'JIRA-402', status: 'New', type: 'Bug'},
                    {key: 'JIRA-403', status: 'Done', type: 'Bug'},
                    // misc
                    {key: 'JIRA-500', status: 'In Progress', type: 'Bug'},
                    // identical
                    {key: 'JIRF-100', status: 'New', type: 'Feature'},
                    {key: 'JIRF-101', status: 'In Progress', type: 'Feature'},
                    {key: 'JIRF-102', status: 'Done', type: 'Feature'},
                    // added
                    {key: 'JIRF-300', status: 'New', type: 'Feature'},
                    {key: 'JIRF-301', status: 'In Progress', type: 'Feature'},
                    {key: 'JIRF-302', status: 'Done', type: 'Feature'},
                    //modified
                    {key: 'JIRF-400', status: 'In Progress', type: 'Feature'},
                    {key: 'JIRF-401', status: 'Done', type: 'Feature'},
                    {key: 'JIRF-402', status: 'New', type: 'Feature'},
                    {key: 'JIRF-403', status: 'Done', type: 'Feature'},
                    // misc
                    {key: 'JIRF-500', status: 'In Progress', type: 'Feature'}
                ]}
            ];

            H.transition('issues', {
                transitionField: 'status',
                filter: function (issue) {return issue.type === 'Bug'; }
            }).fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {}},
                { date: new Date('1995-12-18T03:24:00'), issues: {
                    New: {
                        New: ['JIRA-100'],
                        out: ['JIRA-200'],
                        'In Progress': ['JIRA-400', 'JIRA-500'],
                        Done: ['JIRA-403']
                    },
                    'In Progress': {
                        'In Progress': ['JIRA-101'],
                        out: ['JIRA-201'],
                        Done: ['JIRA-401']
                    },
                    'Done': {
                        Done: ['JIRA-102'],
                        out: ['JIRA-202'],
                        New: ['JIRA-402']
                    },
                    'out': {
                        New: ['JIRA-300'],
                        'In Progress': ['JIRA-301'],
                        Done: ['JIRA-302']
                    }
                }}
            ]);
        });
    });

    describe('count h.f(k).fromArray(d)', function () {
        it('should count array length', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: ['user1', 'user2'], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: ['user3'], modified: ['user1']}}
            ];
            H.count('schemas.added').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), added: 2},
                { date: new Date('1995-12-18T03:24:00'), added: 1},
                { date: new Date('1995-12-20T03:24:00'), added: 1}
            ]);
            H.count('schemas.removed').fromArray(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), removed: 0},
                { date: new Date('1995-12-18T03:24:00'), removed: 1},
                { date: new Date('1995-12-20T03:24:00'), removed: 0}
            ]);
        });
    });

    describe('chaining h.f(k).f(k).fromArray(d)', function () {
        it('should work for timeseries', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}],
                results =
                H.
                timeserie('sessionCount').
                timeserie('schemasCount').
                fromArray(data);

            results.should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}
            ]);
        });

        it('should work on count', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: ['user1', 'user2'], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: ['user3'], modified: ['user1']}}
            ], results =
                H.count('schemas.added').count('schemas.removed').fromArray(data);

            results.should.eql([
                { date: new Date('1995-12-17T03:24:00'), added: 2, removed: 0},
                { date: new Date('1995-12-18T03:24:00'), added: 1, removed: 1},
                { date: new Date('1995-12-20T03:24:00'), added: 1, removed: 0}
            ]);
        });

        it('compose on flux h.f(k).f(k).fromStore(h.f(k).fromStore(d))', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), schemas: { user1: ['a'], user2: ['b'] }},
                { date: new Date('1995-12-18T03:24:00'), schemas: { user1: ['a'], user3: ['c'] }},
                { date: new Date('1995-12-20T03:24:00'), schemas: { user1: ['b'], user2: ['b'], user3: ['c'] }}
            ],
                results = H.count('schemas.added').count('schemas.removed').fromArray(H.fluxObj('schemas').fromArray(data));

            results.should.eql([
                { date: new Date('1995-12-17T03:24:00'), added: 0, removed: 0},
                { date: new Date('1995-12-18T03:24:00'), added: 1, removed: 1},
                { date: new Date('1995-12-20T03:24:00'), added: 1, removed: 0}
            ]);
        });
    });

    describe('Readme example', function () {

        it('is valid for simple data flux', function () {
            var reports = [
                {date: new Date('2015-12-01T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New', type: 'Feature'}, { key: 'JIRA-456', status: 'In Progress', type: 'Bug'}]},
                {date: new Date('2015-12-02T03:22:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', type: 'Feature'}, { key: 'JIRA-789', status: 'In Progress', type: 'Bug'}]},
                {date: new Date('2015-12-03T03:30:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', type: 'Feature'}, { key: 'JIRA-789', status: 'Done', type: 'Bug'}, { key: 'JIRA-900', type: 'Bug', status: 'Done'}, { key: 'JIRA-901', status: 'Done', type: 'Bug'}]}];

            H.flux('issues').fromArray(reports).should.eql([
                {date: new Date('2015-12-01T03:24:00'), issues: { added: [], removed: [], modified: [], identical: []}},
                {date: new Date('2015-12-02T03:22:00'), issues: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: ['JIRA-123'], identical: []}},
                {date: new Date('2015-12-03T03:30:00'), issues: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: ['JIRA-789'], identical: ['JIRA-123']}}
            ]);

            function bugs(report) {
                return report.issues.filter(function (issue) {return issue.type === 'Bug'; });
            }

            H.flux(bugs).fromArray(reports).should.eql([
                {date: new Date('2015-12-01T03:24:00'), bugs: { added: [], removed: [], modified: [], identical: []}},
                {date: new Date('2015-12-02T03:22:00'), bugs: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: [], identical: []}},
                {date: new Date('2015-12-03T03:30:00'), bugs: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: ['JIRA-789'], identical: []}}
            ]);
        });

        it('is valid for timeserie examples', function () {
            var reports = [
                { date: new Date('1995-12-17T03:24:00'), sessions: 100, disk: {free: 2000, used: 1000}},
                { date: new Date('1995-12-18T03:24:00'), sessions: 110, disk: {free: 1500, used: 1500}},
                { date: new Date('1995-12-20T03:24:00'), sessions: 120, disk: {free: 1000, used: 2000}}
            ];

            H.timeserie('sessions').fromArray(reports).should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessions: 100},
                { date: new Date('1995-12-18T03:24:00'), sessions: 110},
                { date: new Date('1995-12-20T03:24:00'), sessions: 120}
            ]);
            H.timeserie('disk.used').fromArray(reports).should.eql([
                { date: new Date('1995-12-17T03:24:00'), used: 1000},
                { date: new Date('1995-12-18T03:24:00'), used: 1500},
                { date: new Date('1995-12-20T03:24:00'), used: 2000}
            ]);

            function diskUsageRatio(report) {
                return report.disk.used / (report.disk.free + report.disk.used);
            }
            H.timeserie(diskUsageRatio).fromArray(reports).should.eql([
                { date: new Date('1995-12-17T03:24:00'), diskUsageRatio: 0.3333333333333333},
                { date: new Date('1995-12-18T03:24:00'), diskUsageRatio: 0.5},
                { date: new Date('1995-12-20T03:24:00'), diskUsageRatio: 0.6666666666666666}
            ]);
        });

        it('is valid for chaining', function () {
            var reports = [
                {date: new Date('2015-12-01T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New', type: 'Feature'}, { key: 'JIRA-456', status: 'In Progress', type: 'Bug'}]},
                {date: new Date('2015-12-02T03:22:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', type: 'Feature'}, { key: 'JIRA-789', status: 'In Progress', type: 'Bug'}]},
                {date: new Date('2015-12-03T03:30:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', type: 'Feature'}, { key: 'JIRA-789', status: 'Done', type: 'Bug'}, { key: 'JIRA-900', type: 'Bug', status: 'Done'}, { key: 'JIRA-901', status: 'Done', type: 'Bug'}]}];

            function bugsCount(report) {
                return report.issues.filter(function (item) {return item.type === 'Bug'; }).length;
            }

            function featuresCount(report) {
                return report.issues.filter(function (item) {return item.type === 'Feature'; }).length;
            }

            H.timeserie(bugsCount).flux('issues').timeserie(featuresCount).fromArray(reports).should.eql([
                {date: new Date('2015-12-01T03:24:00'), bugsCount: 1, featuresCount: 1, issues: { added: [], removed: [], modified: [], identical: []}},
                {date: new Date('2015-12-02T03:22:00'), bugsCount: 1, featuresCount: 1, issues: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: ['JIRA-123'], identical: []}},
                {date: new Date('2015-12-03T03:30:00'), bugsCount: 3, featuresCount: 1, issues: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: ['JIRA-789'], identical: ['JIRA-123']}}
            ]);
        });
    });

    describe('named queries', function () {
        it('has id when defined', function () {
            var q = H.name({id: 'myId'}).timeserie('sessionCount');
            q.id.should.be.equal('myId');
        });
        it('has undefined id when not defined', function () {
            var q = H.timeserie('sessionCount');
            assert.isUndefined(q.id);
        });
    });
});
