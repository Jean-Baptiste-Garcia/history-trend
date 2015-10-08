/*jslint node: true*/
/*global describe: true, it: true */
'use strict';

var should = require('chai').should(),
    H = require('../index');

describe('history-trend', function () {
    describe('timeSerie', function () {
        it('works for simple data : h.f(k).data(d)', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ];
            H.timeserie('sessionCount').data(data).should.eql(data);
        });

        it('should only returns timeSerie fields', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}
            ];
            H.timeserie('sessionCount').data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
            H.timeserie('schemasCount').data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), schemasCount: 40}
            ]);
        });

        it('can access nested object', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), status: {sessionCount: 100, schemasCount: 10}},
                { date: new Date('1995-12-18T03:24:00'), status: {sessionCount: 110, schemasCount: 20}},
                { date: new Date('1995-12-20T03:24:00'), status: {sessionCount: 120, schemasCount: 40}}

            ];
            H.timeserie('status.sessionCount').data(data).should.eql([
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
            H.timeserie('status.sessions.sessionCount').data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
        });
    });

    describe('timeSerie with custom date field', function () {

        it('manages simple path h.f(k).data(d, dk)', function () {
            var data = [
                { creationdate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { creationdate: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { creationdate: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ];
            H.timeserie('sessionCount').data(data, 'creationdate').should.eql(data);
        });

        it('manages nested path h.f(k).data(d, s.dk0)', function () {
            var data = [
                { status: {creationdate: new Date('1995-12-17T03:24:00')}, sessionCount: 100},
                { status: {creationdate: new Date('1995-12-18T03:24:00')}, sessionCount: 110},
                { status: {creationdate: new Date('1995-12-20T03:24:00')}, sessionCount: 120}
            ];
            H.timeserie('sessionCount').data(data, 'status.creationdate').should.eql([
                { creationdate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { creationdate: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { creationdate: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
        });

        it('manages named date getter h.f(k).data(d, getdate)', function () {
            var data = [
                { status: {creationdate: new Date('1995-12-17T03:24:00')}, sessionCount: 100},
                { status: {creationdate: new Date('1995-12-18T03:24:00')}, sessionCount: 110},
                { status: {creationdate: new Date('1995-12-20T03:24:00')}, sessionCount: 120}
            ],
                dateGetter = function reportdate(report) { return report.status.creationdate; };

            H.timeserie('sessionCount').data(data, dateGetter).should.eql([
                { reportdate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { reportdate: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { reportdate: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
        });
        it('manages anonymous date getter h.f(k).data(d, getdate)', function () {
            var data = [
                { status: {creationdate: new Date('1995-12-17T03:24:00')}, sessionCount: 100},
                { status: {creationdate: new Date('1995-12-18T03:24:00')}, sessionCount: 110},
                { status: {creationdate: new Date('1995-12-20T03:24:00')}, sessionCount: 120}
            ],
                dateGetter = function (report) { return report.status.creationdate; };

            H.timeserie('sessionCount').data(data, dateGetter).should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
        });

        // TODO add date field that duplicates a report field (priority to date field or raise an error)
    });

    describe('timeserie with custom function h.f(g).data(d)', function () {
        it('can count array length', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: ['user1', 'user2'], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: ['user3'], modified: ['user1']}}
            ],
                countadded = function (item) {
                    return item.schemas.added.length;
                };
            H.timeserie(countadded).data(data).should.eql([
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

            H.timeserie(customfunction).data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), mult: 100 * 10},
                { date: new Date('1995-12-18T03:24:00'), mult: 110 * 20},
                { date: new Date('1995-12-20T03:24:00'), mult: 120 * 40}
            ]);
        });

        it('work when chained h.f(g).f(k).data(d)', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}

            ],
                customfunction = function (item) {
                    return item.sessionCount * item.schemasCount;
                };

            H.timeserie(customfunction).timeserie('schemasCount').data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), value: 100 * 10, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), value: 110 * 20, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), value: 120 * 40, schemasCount: 40}
            ]);
        });


        it('works when chained with another custom function (both named) h.f(g).f(h).data(d)', function () {
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

            H.timeserie(customfunction1).timeserie(customfunction2).data(data).should.eql(
                [
                    { date: new Date('1995-12-17T03:24:00'), mult: 100 * 10, sum: 100 + 10},
                    { date: new Date('1995-12-18T03:24:00'), mult: 110 * 20, sum: 110 + 20},
                    { date: new Date('1995-12-20T03:24:00'), mult: 120 * 40, sum: 120 + 40}
                ]
            );
        });

        it('works when chained with another custom function (both anonymous) h.f(g).f(h).data(d)', function () {
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

            H.timeserie(customfunction1).timeserie(customfunction2).data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), value1: 100 * 10, value2: 100 + 10},
                { date: new Date('1995-12-18T03:24:00'), value1: 110 * 20, value2: 110 + 20},
                { date: new Date('1995-12-20T03:24:00'), value1: 120 * 40, value2: 120 + 40}
            ]);
        });
    });

    describe('flux on object h.f(k).data(d)', function () {
        it('should work on simple data', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), schemas: { user1: ['a'], user2: ['b'] }},
                { date: new Date('1995-12-18T03:24:00'), schemas: { user1: ['a'], user3: ['c'] }},
                { date: new Date('1995-12-20T03:24:00'), schemas: { user1: ['b'], user2: ['b'], user3: ['c'] }}
            ];

            H.fluxObj('schemas').data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: ['user1', 'user2'], removed: [], identical: [], modified: []}},
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

            H.fluxObj('schemas').data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: ['user1', 'user2'], removed: [], identical: [], modified: []}},
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

            H.fluxObj('status.schemas').data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: ['user1', 'user2'], removed: [], identical: [], modified: []}},
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

            H.fluxObj(schemas).data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: ['user1', 'user2'], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: ['user3'], modified: ['user1']}}
            ]);
        });
    });

    // TODO add tests on non existing properties

    describe('flux on array h.f(k).data(d)', function () {
        it('should work on nominal data', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}]}
            ];

            H.flux('issues').data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: ['JIRA-123', 'JIRA-456'], removed: [], identical: [], modified: []}},
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

            H.flux('issues').data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: ['JIRA-456', 'JIRA-123'], removed: [], identical: [], modified: []}},
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

            H.flux('issues', {identification: 'id'}).data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: ['JIRA-123', 'JIRA-456'], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']}},
                { date: new Date('1995-12-20T03:24:00'), issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']}}
            ]);
        });

        it('should work with custom output', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}]}
            ];

            H.flux('issues', {
                identical: function (identicals) { return identicals.length; },
                modified:  function (modifieds) { return modifieds.length; }
            }).data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: ['JIRA-123', 'JIRA-456'], removed: [], identical: 0, modified: 0}},
                { date: new Date('1995-12-18T03:24:00'), issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: 0, modified: 1}},
                { date: new Date('1995-12-20T03:24:00'), issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: 1, modified: 1}}
            ]);
        });

        it('should work with custom identity and custom output', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), issues: [{ id: 'JIRA-123', status: 'New'}, { id: 'JIRA-456', status: 'In Progress'}]},
                { date: new Date('1995-12-18T03:24:00'), issues: [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'In Progress'}]},
                { date: new Date('1995-12-20T03:24:00'), issues: [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'Done'}, { id: 'JIRA-900', status: 'Done'}, { id: 'JIRA-901', status: 'Done'}]}
            ];

            H.flux('issues', {
                identification: 'id',
                identical: function (identicals) { return identicals.length; },
                modified:  function (modifieds) { return modifieds.length; }
            }).data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), issues: {added: ['JIRA-123', 'JIRA-456'], removed: [], identical: 0, modified: 0}},
                { date: new Date('1995-12-18T03:24:00'), issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: 0, modified: 1}},
                { date: new Date('1995-12-20T03:24:00'), issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: 1, modified: 1}}
            ]);
        });

    });

    describe('count h.f(k).data(d)', function () {
        it('should count array length', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), schemas: {added: ['user1', 'user2'], removed: [], identical: [], modified: []}},
                { date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
                { date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: ['user3'], modified: ['user1']}}
            ];
            H.count('schemas.added').data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), added: 2},
                { date: new Date('1995-12-18T03:24:00'), added: 1},
                { date: new Date('1995-12-20T03:24:00'), added: 1}
            ]);
            H.count('schemas.removed').data(data).should.eql([
                { date: new Date('1995-12-17T03:24:00'), removed: 0},
                { date: new Date('1995-12-18T03:24:00'), removed: 1},
                { date: new Date('1995-12-20T03:24:00'), removed: 0}
            ]);
        });
    });

    describe('chaining h.f(k).f(k).data(d)', function () {
        it('should work for timeseries', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
                { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}],
                results =
                H.
                timeserie('sessionCount').
                timeserie('schemasCount').
                data(data);

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
                H.count('schemas.added').count('schemas.removed').data(data);

            results.should.eql([
                { date: new Date('1995-12-17T03:24:00'), added: 2, removed: 0},
                { date: new Date('1995-12-18T03:24:00'), added: 1, removed: 1},
                { date: new Date('1995-12-20T03:24:00'), added: 1, removed: 0}
            ]);
        });

        it('compose on flux h.f(k).f(k).data(h.f(k).data(d))', function () {
            var data = [
                { date: new Date('1995-12-17T03:24:00'), schemas: { user1: ['a'], user2: ['b'] }},
                { date: new Date('1995-12-18T03:24:00'), schemas: { user1: ['a'], user3: ['c'] }},
                { date: new Date('1995-12-20T03:24:00'), schemas: { user1: ['b'], user2: ['b'], user3: ['c'] }}
            ],
                results = H.count('schemas.added').count('schemas.removed').data(H.fluxObj('schemas').data(data));

            results.should.eql([
                { date: new Date('1995-12-17T03:24:00'), added: 2, removed: 0},
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

            H.flux('issues').data(reports).should.eql([
                {date: new Date('2015-12-01T03:24:00'), issues: { added: ['JIRA-123', 'JIRA-456'], removed: [], modified: [], identical: []}},
                {date: new Date('2015-12-02T03:22:00'), issues: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: ['JIRA-123'], identical: []}},
                {date: new Date('2015-12-03T03:30:00'), issues: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: ['JIRA-789'], identical: ['JIRA-123']}}
            ]);

            function bugs(report) {
                return report.issues.filter(function (issue) {return issue.type === 'Bug'; });
            }

            H.flux(bugs).data(reports).should.eql([
                {date: new Date('2015-12-01T03:24:00'), bugs: { added: ['JIRA-456'], removed: [], modified: [], identical: []}},
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

            H.timeserie('sessions').data(reports).should.eql([
                { date: new Date('1995-12-17T03:24:00'), sessions: 100},
                { date: new Date('1995-12-18T03:24:00'), sessions: 110},
                { date: new Date('1995-12-20T03:24:00'), sessions: 120}
            ]);
            H.timeserie('disk.used').data(reports).should.eql([
                { date: new Date('1995-12-17T03:24:00'), used: 1000},
                { date: new Date('1995-12-18T03:24:00'), used: 1500},
                { date: new Date('1995-12-20T03:24:00'), used: 2000}
            ]);

            function diskUsageRatio(report) {
                return report.disk.used / (report.disk.free + report.disk.used);
            }
            H.timeserie(diskUsageRatio).data(reports).should.eql([
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

            H.timeserie(bugsCount).flux('issues').timeserie(featuresCount).data(reports).should.eql([
                {date: new Date('2015-12-01T03:24:00'), bugsCount: 1, featuresCount: 1, issues: { added: ['JIRA-123', 'JIRA-456'], removed: [], modified: [], identical: []}},
                {date: new Date('2015-12-02T03:22:00'), bugsCount: 1, featuresCount: 1, issues: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: ['JIRA-123'], identical: []}},
                {date: new Date('2015-12-03T03:30:00'), bugsCount: 3, featuresCount: 1, issues: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: ['JIRA-789'], identical: ['JIRA-123']}}
            ]);
        });

    });
});
