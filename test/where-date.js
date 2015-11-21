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
    H = require('../index'),
    WW = require('../../history-when/index');


describe('history-trend with when', function () {
    describe('timeSerie', function () {
        it('works for dated objects whereDate is last24h', function () {
            var W = WW({present:  new Date('1995-12-20T09:24:00')}),
                data = [
                    {date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    {date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                    {date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
                ];
            H.timeserie('sessionCount').whereDate(W.last24h(function (o) {return o.date; })).fromArray(data).should.eql([
                {date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
        });

        it('works for dated objects whereDate is daily', function () {
            var W = WW({present:  new Date('1995-12-20T09:24:00')}),
                data = [
                    {date: new Date('1995-12-17T03:20:00'), sessionCount: 1},
                    {date: new Date('1995-12-17T03:24:00'), sessionCount: 2},
                    {date: new Date('1995-12-18T03:24:00'), sessionCount: 3},
                    {date: new Date('1995-12-20T03:24:00'), sessionCount: 4},
                    {date: new Date('1995-12-20T04:24:00'), sessionCount: 5}
                ];
            H.timeserie('sessionCount').whereDate(W.daily(function (o) {return o.date; })).fromArray(data).should.eql([
                {date: new Date('1995-12-17T03:24:00'), sessionCount: 2},
                {date: new Date('1995-12-18T03:24:00'), sessionCount: 3},
                {date: new Date('1995-12-20T04:24:00'), sessionCount: 5}
            ]);
            data[0].sessionCount.should.equal(1, 'reports are not modified');
        });

    });
});

describe('where date', function () {

    describe('on default store', function () {

        var hs;

        beforeEach(function startAndPopulateServer(done) {
            fse.removeSync(path.resolve(storageRoot));
            hs = historystore(storageRoot).report('MyServer');

            var reports = [
                    {date: new Date('1995-12-17T02:24:00'), v: 0},
                    {date: new Date('1995-12-17T03:24:00'), v: 1},
                    {date: new Date('1995-12-18T04:44:10'), v: 2},
                    {date: new Date('1995-12-19T05:44:10'), v: 3},
                    {date: new Date('1995-12-19T06:44:10'), v: 4}
                ];
            async.series(reports.map(function makePut(report) {
                return function put(callback) {
                    hs.put(report, callback);
                };
            }), done);
        });

        it('computes timeserie for last24h', function (done) {
            var W = WW({present:  new Date('1995-12-19T09:24:00')});
            H
                .timeserie('v')
                .whereDate(W.last24h(function (o) {return o.date; }))
                .fromStore(hs, function (err, timeserie) {
                    if (err) {return done(err); }
                    timeserie.should.eql([
                        {date: new Date('1995-12-19T05:44:10'), v: 3},
                        {date: new Date('1995-12-19T06:44:10'), v: 4}
                    ]);
                    done();
                });
        });

        it('computes timeserie daily', function (done) {
            var W = WW({present:  new Date('1995-12-19T09:24:00')});
            H
                .timeserie('v')
                .whereDate(W.daily(function (o) {return o.date; }))
                .fromStore(hs, function (err, timeserie) {
                    if (err) {return done(err); }
                    timeserie.should.eql([
                        {date: new Date('1995-12-17T03:24:00'), v: 1},
                        {date: new Date('1995-12-18T04:44:10'), v: 2},
                        {date: new Date('1995-12-19T06:44:10'), v: 4}
                    ]);
                    done();
                });
        });

        it('supports caching for daily', function (done) {
            var W = WW({present:  new Date('1995-12-19T09:24:00')}),
                q = hs.cache(H.timeserie('v').whereDate(W.daily(function (o) {return o.date; })));

            q.trends(function (err, trends) {
                if (err) { return done(err); }
                trends.should.eql([
                    {date: new Date('1995-12-17T03:24:00'), v: 1},
                    {date: new Date('1995-12-18T04:44:10'), v: 2},
                    {date: new Date('1995-12-19T06:44:10'), v: 4}
                ], '1st timeserie');
                hs.put({date: new Date('1995-12-19T07:44:10'), v: 5}, function (err) {
                    if (err) {return done(err); }
                    q.trends(function (err2, trends2) {
                        if (err2) { return done(err2); }
                        // TODO check cache file has changed
                        trends2.should.eql([
                            {date: new Date('1995-12-17T03:24:00'), v: 1},
                            {date: new Date('1995-12-18T04:44:10'), v: 2},
                            {date: new Date('1995-12-19T07:44:10'), v: 5}
                        ], 'second timeserie');
                        // TODO get trend again and check file has not changed
                        done();
                    });
                });
            });
        });
        // TODO check flux / whereDate

    });
});