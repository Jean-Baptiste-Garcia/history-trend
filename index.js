/*jslint node: true */

module.exports = (function () {
    'use strict';
    var Readable = require('stream').Readable,
        R = require('ramda'),
        TimeSerie = require('./modules/timeserie/timeserie'),
        Count = require('./modules/count/count'),
        Flux = require('./modules/flux/flux'),
        Chain;


    // returns last component of a path k1.k2.k3 --> k3
    function lastPathComponent(path) {
        var paths = path.split('.');
        return paths[paths.length - 1];
    }

    function trendName(option, defaultname) {
        switch (typeof option) {
        case 'string':
            return lastPathComponent(option);
        case 'function':
            return option.name || defaultname || 'value';
        default:
            throw new Error('Unknown option type ' + typeof option);
        }
    }

    // returns a function to access value for given a path
    // path like 'key1.key2.key3' --> obj[key1][key2][key3]
    function makePathGetter(path) {
        var paths = path.split('.');

        switch (paths.length) {
        case 0:
            throw 'bad path ' + path;
        case 1:
            return function (obj) { return obj[path]; };
        case 2:
            return function (obj) { return obj[paths[0]][paths[1]]; };
        default:
            return R.path(paths);
        }
    }

    function makeGetter(field) {
        switch (typeof field) {
        case 'string':
            return makePathGetter(field);
        case 'function':
            return field;
        default:
            throw new Error('Unknown getter type ' + typeof field);
        }
    }

    /**
    * construct a chain object to allow :
    * h.timeserie(field1).flux(field2).data(myData)
    * return [ {date: d, field1: v1, field2: v2 ...}]
    */
    Chain = function (Trends) {
        var chain,
            actions = [],
            datefield = 'date',
            dategetter = function (report) { return report.date; },
            trends;

        function beginTrends(customdate) {
            if (customdate) {
                dategetter = makeGetter(customdate);
                datefield = trendName(customdate, 'date');
            }

            (function uniqueTrendNames() {

                var moreThanOnceCounter = R.compose(
                    R.mapObj(function (count) { return count > 1 ? 1 : 0; }), // 0 means unique , 1 means more than once
                    R.countBy(R.prop('name')) // count number of actions with same name
                ),
                    moreThanOnce = moreThanOnceCounter(actions);

                // rename duplicates v1, v2, v3
                actions = actions.map(function (action) {
                    var naction = R.clone(action);
                    naction.trendName = action.name;
                    if (moreThanOnce[action.name] > 0) {
                        naction.trendName += moreThanOnce[action.name];
                        moreThanOnce[action.name] += 1; // now moreThanOnce is used as a counter
                    }
                    return naction;
                });
            }());

            trends = [];
        }

        function trendValue(report) {
            var trendItem = {};

            trendItem[datefield] = dategetter(report);

            actions.forEach(function (action) {
                trendItem[action.trendName] = action.reporter(report);
            });

            trends.push(trendItem);
        }

        function endTrends() {
            var bak = trends;
            actions = trends = null;
            return bak;
        }

        function syncCompute(reports, customdate) {
            beginTrends(customdate);
            reports.forEach(trendValue);
            return endTrends();
        }

        function streamCompute(stream, cb) {
            var lasterror;
            beginTrends(stream.customdate);
            stream.on('data', trendValue);

            stream.on('error', function (err) {lasterror = err; });

            stream.on('end', function () {
                cb(lasterror, lasterror ? undefined : trends);
                endTrends();
            });
        }

        // function that ends current chain
        // execute computation
        function compute(data, cb) {
            return data instanceof Readable ?
                    streamCompute(data, cb) :
                    syncCompute(data, cb);
        }


        // make public (chained) Trend function
        // which simply pushes an action and returns chain
        function makeChainedTrend(Trend) {
            return function (field, options) {
                actions.push({name: trendName(field), reporter: new Trend(makeGetter(field), options)});
                return chain;
            };
        }

        chain = R.mapObj(makeChainedTrend)(Trends);
        chain.data = compute;

        return chain;
    };

    function init(Trends) {
        // first functions called by user when using HistoryTrend
        // then chained functions are called (see Chain imp)
        function makePublicTrend(Trend, key) {
            return function publicTrend(field) {
                var options = Array.prototype.slice.call(arguments, 1); // options are passed in an array, without field 0th arg
                return new Chain(Trends)[key](field, options);
            };
        }
        return R.mapObjIndexed(makePublicTrend)(Trends);
    }

    return init({timeserie: TimeSerie, flux: Flux, count: Count});
}());