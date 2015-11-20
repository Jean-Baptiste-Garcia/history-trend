/*jslint node: true*/
/*global describe: true, it: true */
'use strict';

var should = require('chai').should(),
    assert = require('chai').assert,
    H = require('../index'),
    WW = require('../../history-when/index');


describe('history-trend with when', function () {
    describe('timeSerie', function () {
        it('works for dated objects ', function () {
            var W = WW({present:  new Date('1995-12-20T09:24:00')}),
                data = [
                    { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
                    { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
                    { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
                ];
            H.timeserie('sessionCount').whereDate(W.last24h(function (o) {return o.date; })).fromArray(data).should.eql([
                { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
            ]);
        });
    });
});