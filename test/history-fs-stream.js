/*jslint node: true*/
/*global describe: true, it: true, beforeEach: true */
'use strict';

var should = require('chai').should(),
    assert = require('chai').assert,
    fse = require('fs-extra'),
    path = require('path'),
    async = require('async'),
    historystore = require('../../history-store'),
    storageRoot = '../tmp-history-store',
    H = require('../index');

describe('history-trend on fs store', function () {

    describe('with default streams', function () {

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

        it('can compute timeserie h.f(k).data(stream)', function (done) {
            H.timeserie('status.sessionCount').data(hs.stream(), function (err, timeserie) {
                if (err) {
                    done(err);
                }
                timeserie.should.eql([
                    { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    { date: new Date('1995-12-18T04:44:10'), sessionCount: 101},
                    { date: new Date('1995-12-19T05:44:10'), sessionCount: 102}
                ]);
                done();
            });
        });


        it('can handle stream error.', function (done) {

            fse.writeFileSync(path.resolve(storageRoot + '/MyServer/' + (Date.now() + 10000) + '-938112514.json'), '{"date":"1995-12-17T03:24:00.000Z","status":}');
            var called = 0;
            H.timeserie('status.sessionCount').data(hs.stream(), function (err, timeserie) {
                called += 1;
                assert.isDefined(err);
                if (err) {
                    err.should.equals('Can\'t read report Error: JSON content could not be parsed');
                    assert.isUndefined(timeserie, 'no data should be return');
                }
                done();
            });
        });

        it('can compute direct chained timeserie h.f(k).f(k).data(stream)', function (done) {
            H.timeserie('status.schemasCount').timeserie('status.sessionCount').data(hs.stream(), function (err, timeserie) {
                if (err) {
                    done(err);
                }
                timeserie.should.eql([
                    { date: new Date('1995-12-17T03:24:00'), schemasCount: 10, sessionCount: 100},
                    { date: new Date('1995-12-18T04:44:10'), schemasCount: 5,  sessionCount: 101},
                    { date: new Date('1995-12-19T05:44:10'), schemasCount: 20, sessionCount: 102}
                ]);
                done();
            });
        });

        it('can compute timeserie with custom function h.f(g).data(stream)', function (done) {
            function counter(item) {
                return item.status.sessionCount + item.status.schemasCount;
            }
            H.timeserie(counter).data(hs.stream(), function (err, timeserie) {
                if (err) {
                    done(err);
                }
                timeserie.should.eql([
                    { date: new Date('1995-12-17T03:24:00'), counter: 100 + 10},
                    { date: new Date('1995-12-18T04:44:10'), counter: 101 + 5},
                    { date: new Date('1995-12-19T05:44:10'), counter: 102 + 20}
                ]);
                done();
            });
        });
    });

    describe('with custom simple date stream', function () {

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

        it('can compute timeserie h.f(k).data(stream)', function (done) {
            H.timeserie('status.sessionCount').data(hs.stream(), function (err, timeserie) {
                if (err) {
                    done(err);
                }
                timeserie.should.eql([
                    { creationdate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    { creationdate: new Date('1995-12-18T04:44:10'), sessionCount: 101},
                    { creationdate: new Date('1995-12-19T05:44:10'), sessionCount: 102}
                ]);
                done();
            });
        });
    });


    describe('with custom nested path date stream', function () {

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

        it('can compute timeserie h.f(k).data(stream)', function (done) {
            H.timeserie('status.sessionCount').data(hs.stream(), function (err, timeserie) {
                if (err) {
                    done(err);
                }
                timeserie.should.eql([
                    { creationdate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    { creationdate: new Date('1995-12-18T04:44:10'), sessionCount: 101},
                    { creationdate: new Date('1995-12-19T05:44:10'), sessionCount: 102}
                ]);
                done();
            });
        });
    });

    describe('with custom named function date stream', function () {

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

        it('can compute timeserie h.f(k).data(stream)', function (done) {
            H.timeserie('status.sessionCount').data(hs.stream(), function (err, timeserie) {
                if (err) {
                    done(err);
                }
                timeserie.should.eql([
                    { ddate: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    { ddate: new Date('1995-12-18T04:44:10'), sessionCount: 101},
                    { ddate: new Date('1995-12-19T05:44:10'), sessionCount: 102}
                ]);
                done();
            });
        });
    });


    describe('with custom anonymous function date stream', function () {
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

        it('can compute timeserie h.f(k).data(stream)', function (done) {
            H.timeserie('status.sessionCount').data(hs.stream(), function (err, timeserie) {
                if (err) {
                    done(err);
                }
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
