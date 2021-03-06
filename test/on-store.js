/*jslint node: true*/
/*global describe: true, it: true, beforeEach: true, afterEach: true */
'use strict';

var should = require('chai').should(),
    assert = require('chai').assert,
    fse = require('fs-extra'),
    path = require('path'),
    async = require('async'),
    R = require('ramda'),
    historystore = require('../../history-store'),
    storageRoot = '../tmp-history-store',
    H = require('../index'),
    WW = require('../../history-when/index');

describe('history-trend on fs store', function () {

    describe('with default store', function () {

        var hs;

        beforeEach(function startAndPopulateServer(done) {
            fse.removeSync(path.resolve(storageRoot));
            hs = historystore(storageRoot).report('MyServer');

            var reports = [
                    { date: new Date('1995-12-17T03:24:00'), status: {sessionCount: 100, schemasCount: 10}},
                    { date: new Date('1995-12-18T04:44:10'), status: {sessionCount: 101, schemasCount: 5}},
                    { date: new Date('1995-12-19T05:44:10'), status: {sessionCount: 102, schemasCount: 20}}
                ];
            async.series(reports.map(function makePut(report) {
                return function put(callback) {
                    hs.put(report, callback);
                };
            }), done);
        });

        it('computes timeserie h.f(k).fromStore(store, cb)', function (done) {
            H.timeserie('status.sessionCount').fromStore(hs, function (err, timeserie) {
                if (err) {return done(err); }
                timeserie.should.eql([
                    { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    { date: new Date('1995-12-18T04:44:10'), sessionCount: 101},
                    { date: new Date('1995-12-19T05:44:10'), sessionCount: 102}
                ]);
                done();
            });
        });

        it('handles stream error.', function (done) {

            fse.writeFileSync(path.resolve(storageRoot + '/MyServer/' + (Date.now() + 10000) + '-938112514.json'), '{"date":"1995-12-17T03:24:00.000Z","status":}');
            var called = 0;
            H.timeserie('status.sessionCount').fromStore(hs, function (err, timeserie) {
                called += 1;
                assert.isDefined(err);
                if (err) {
                    err.should.equals('Can\'t read report Error: JSON content could not be parsed');
                    assert.isUndefined(timeserie, 'no data should be return');
                }
                done();
            });
        });

        it('computes chained timeserie h.f(k).f(k).fromStore(store, cb)', function (done) {
            H.timeserie('status.schemasCount').timeserie('status.sessionCount').fromStore(hs, function (err, timeserie) {
                if (err) {return done(err); }
                timeserie.should.eql([
                    { date: new Date('1995-12-17T03:24:00'), schemasCount: 10, sessionCount: 100},
                    { date: new Date('1995-12-18T04:44:10'), schemasCount: 5,  sessionCount: 101},
                    { date: new Date('1995-12-19T05:44:10'), schemasCount: 20, sessionCount: 102}
                ]);
                done();
            });
        });

        it('computes timeserie with custom function h.f(g).fromStore(store, cb)', function (done) {
            function counter(item) {
                return item.status.sessionCount + item.status.schemasCount;
            }
            H.timeserie(counter).fromStore(hs, function (err, timeserie) {
                if (err) {return done(err); }
                timeserie.should.eql([
                    { date: new Date('1995-12-17T03:24:00'), counter: 100 + 10},
                    { date: new Date('1995-12-18T04:44:10'), counter: 101 + 5},
                    { date: new Date('1995-12-19T05:44:10'), counter: 102 + 20}
                ]);
                done();
            });
        });
    });

    describe('with string custom date store', function () {

        var hs;

        beforeEach(function startAndPopulateServer(done) {
            fse.removeSync(path.resolve(storageRoot));
            hs = historystore(storageRoot).report('MyServer', 'creationdate');

            var reports = [
                    { creationdate: new Date('1995-12-17T03:24:00'), status: {sessionCount: 100, schemasCount: 10}},
                    { creationdate: new Date('1995-12-18T04:44:10'), status: {sessionCount: 101, schemasCount: 5}},
                    { creationdate: new Date('1995-12-19T05:44:10'), status: {sessionCount: 102, schemasCount: 20}}
                ];
            async.series(reports.map(function makePut(report) {
                return function put(callback) {
                    hs.put(report, callback);
                };
            }), done);
        });

        it('computes timeserie h.f(k).fromStore(store, cb)', function (done) {
            H.timeserie('status.sessionCount').fromStore(hs, function (err, timeserie) {
                if (err) {return done(err); }
                timeserie.should.eql([
                    { creationdate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    { creationdate: new Date('1995-12-18T04:44:10'), sessionCount: 101},
                    { creationdate: new Date('1995-12-19T05:44:10'), sessionCount: 102}
                ]);
                done();
            });
        });
    });

    describe('with custom nested date', function () {
        var hs;

        beforeEach(function startAndPopulateServer(done) {
            fse.removeSync(path.resolve(storageRoot));
            hs = historystore(storageRoot).report('MyServer', 'status.creationdate');

            var reports = [
                    { status: {creationdate: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10}},
                    { status: {creationdate: new Date('1995-12-18T04:44:10'), sessionCount: 101, schemasCount: 5}},
                    { status: {creationdate: new Date('1995-12-19T05:44:10'), sessionCount: 102, schemasCount: 20}}
                ];
            async.series(reports.map(function makePut(report) {
                return function put(callback) {
                    hs.put(report, callback);
                };
            }), done);
        });

        it('computes timeserie h.f(k).fromStore(store, cb)', function (done) {
            H.timeserie('status.sessionCount').fromStore(hs, function (err, timeserie) {
                if (err) { return done(err); }
                timeserie.should.eql([
                    { creationdate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    { creationdate: new Date('1995-12-18T04:44:10'), sessionCount: 101},
                    { creationdate: new Date('1995-12-19T05:44:10'), sessionCount: 102}
                ]);
                done();
            });
        });
    });

    describe('with custom named function date', function () {
        var hs;
        beforeEach(function startAndPopulateServer(done) {
            fse.removeSync(path.resolve(storageRoot));
            hs = historystore(storageRoot).report('MyServer', function ddate(report) {return report.status.creationdate; });

            var reports = [
                    { status: {creationdate: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10}},
                    { status: {creationdate: new Date('1995-12-18T04:44:10'), sessionCount: 101, schemasCount: 5}},
                    { status: {creationdate: new Date('1995-12-19T05:44:10'), sessionCount: 102, schemasCount: 20}}
                ];
            async.series(reports.map(function makePut(report) {
                return function put(callback) {
                    hs.put(report, callback);
                };
            }), done);
        });

        it('can compute timeserie h.f(k).fromStore(store, cb)', function (done) {
            H.timeserie('status.sessionCount').fromStore(hs, function (err, timeserie) {
                if (err) { return done(err); }
                timeserie.should.eql([
                    { ddate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    { ddate: new Date('1995-12-18T04:44:10'), sessionCount: 101},
                    { ddate: new Date('1995-12-19T05:44:10'), sessionCount: 102}
                ]);
                done();
            });
        });
    });

    describe('with custom anonymous function date', function () {
        var hs;

        beforeEach(function startAndPopulateServer(done) {
            fse.removeSync(path.resolve(storageRoot));
            hs = historystore(storageRoot).report('MyServer', function (report) {return report.status.creationdate; });

            var reports = [
                    { status: {creationdate: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10}},
                    { status: {creationdate: new Date('1995-12-18T04:44:10'), sessionCount: 101, schemasCount: 5}},
                    { status: {creationdate: new Date('1995-12-19T05:44:10'), sessionCount: 102, schemasCount: 20}}
                ];
            async.series(reports.map(function makePut(report) {
                return function put(callback) {
                    hs.put(report, callback);
                };
            }), done);
        });

        it('computes timeserie h.f(k).fromStore(store, cb)', function (done) {
            var q = H.timeserie('status.sessionCount');
            q.fromStore(hs, function (err, timeserie) {
                if (err) {return done(err); }
                timeserie.should.eql([
                    { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    { date: new Date('1995-12-18T04:44:10'), sessionCount: 101},
                    { date: new Date('1995-12-19T05:44:10'), sessionCount: 102}
                ]);
                done();
            });
        });

        it('h.f(k) can be used twice', function (done) {
            var q = H.timeserie('status.sessionCount');
            q.fromStore(hs, function (err, timeserie) {
                if (err) {return done(err); }
                timeserie.should.eql([
                    { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    { date: new Date('1995-12-18T04:44:10'), sessionCount: 101},
                    { date: new Date('1995-12-19T05:44:10'), sessionCount: 102}
                ]);
                q.fromStore(hs, function (err, timeserie) {
                    if (err) {return done(err); }
                    timeserie.should.eql([
                        { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                        { date: new Date('1995-12-18T04:44:10'), sessionCount: 101},
                        { date: new Date('1995-12-19T05:44:10'), sessionCount: 102}
                    ]);
                    done();
                });
            });
        });
    });

    describe('computes flux', function () {
        it('when flux called after timeserie', function (done) {
            fse.removeSync(path.resolve(storageRoot));
            var hs = historystore(storageRoot).report('MyServer'),
                reports = [
                    { date: new Date('1995-12-17T03:24:00'), x: 1, issues: [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}]},
                    { date: new Date('1995-12-18T03:24:00'), x: 2, issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}]},
                    { date: new Date('1995-12-20T03:24:00'), x: 3, issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}]}];
            async.series(reports.map(function makePut(report) {
                return function put(callback) {
                    hs.put(report, callback);
                };
            }),
                function () {
                    H.timeserie('x').flux('issues').fromStore(hs, function (err, timeserie) {
                        if (err) {return done(err); }
                        timeserie.should.eql([
                            { date: new Date('1995-12-17T03:24:00'), x: 1, issues: {added: [], removed: [], identical: [], modified: []}},
                            { date: new Date('1995-12-18T03:24:00'), x: 2, issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: [], modified: ['JIRA-123']}},
                            { date: new Date('1995-12-20T03:24:00'), x: 3, issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: ['JIRA-123'], modified: ['JIRA-789']}}
                        ]);
                        done();
                    });
                });
        });

        it('when flux have options and is called after timeserie', function (done) {
            fse.removeSync(path.resolve(storageRoot));
            var hs = historystore(storageRoot).report('MyServer'),
                reports = [
                    { date: new Date('1995-12-17T03:24:00'), x: 1, issues: [{ id: 'JIRA-123', status: 'New'}, { id: 'JIRA-456', status: 'In Progress'}]},
                    { date: new Date('1995-12-18T03:24:00'), x: 2, issues: [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'In Progress'}]},
                    { date: new Date('1995-12-20T03:24:00'), x: 3, issues: [{ id: 'JIRA-123', status: 'In Progress'}, { id: 'JIRA-789', status: 'Done'}, { id: 'JIRA-900', status: 'Done'}, { id: 'JIRA-901', status: 'Done'}]}];
            async.series(reports.map(function makePut(report) {
                return function put(callback) {
                    hs.put(report, callback);
                };
            }),
                function () {
                    H.timeserie('x').flux('issues', {
                        identification: 'id',
                        identical: H.fluxCounter,
                        modified: H.fluxCounter
                    }).fromStore(hs, function (err, timeserie) {
                        if (err) { return done(err); }
                        timeserie.should.eql([
                            { date: new Date('1995-12-17T03:24:00'), x: 1, issues: {added: [], removed: [], identical: 0, modified: 0}},
                            { date: new Date('1995-12-18T03:24:00'), x: 2, issues: {added: ['JIRA-789'], removed: ['JIRA-456'], identical: 0, modified: 1}},
                            { date: new Date('1995-12-20T03:24:00'), x: 3, issues: {added: ['JIRA-900', 'JIRA-901'], removed: [], identical: 1, modified: 1}}
                        ]);
                        done();
                    });
                });
        });

    });
});
