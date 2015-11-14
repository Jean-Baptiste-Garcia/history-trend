/*jslint node: true */

module.exports = (function () {
    'use strict';
    var Readable = require('stream').Readable,
        R = require('ramda'),
        prop = require('./modules/prop/prop'),
        TimeSerie = require('./modules/timeserie/timeserie'),
        Count = require('./modules/count/count'),
        Flux = require('./modules/flux/flux'),
        FLuxObj  = require('./modules/flux/fluxObj'),
        VariationFlux = require('./modules/flux/variationFLux'),
        Chain;

    function trendname(object, defaultname) {
        return object.name || object.shortpropertyname || defaultname || 'value';
    }

    function uniqueTrendNames(actions) {
        var moreThanOnceCounter = R.compose(
            R.mapObj(function (count) { return count > 1 ? 1 : 0; }), // 0 means unique , 1 means more than once
            R.countBy(R.prop('name')) // count number of actions with same name
        ),
            moreThanOnce = moreThanOnceCounter(actions);

        // rename duplicates value, value, value --> value1, value2, value3
        return actions.map(function (action) {
            var namedaction = R.clone(action);
            namedaction.trendname = action.name;
            if (moreThanOnce[action.name] > 0) {
                namedaction.trendname += moreThanOnce[action.name];
                moreThanOnce[action.name] += 1; // now moreThanOnce is used as a counter
            }
            return namedaction;
        });
    }
    /**
    * construct a chain object to allow :
    * h.timeserie(field1).flux(field2).data(myData)
    * return [ {date: d, field1: v1, field2: v2 ...}]
    */
    Chain = function (Trends) {
        var chain,
            actions = [];

        function compute(cb, source, customdate) {
            var dategetter = prop(customdate || 'date'),
                datekey = trendname(dategetter, 'date'), // for anonymous function
                namedactions = uniqueTrendNames(actions);

            function trendsValue(report) {
                var trendItem = {};
                trendItem[datekey] = dategetter(report);
                namedactions.forEach(function (action, index) {
                    trendItem[action.trendname] = action.trendvalue(report);
                });
                return trendItem;
            }

            function streamCompute(stream, cb, customdate) {
                var trends = [],
                    lasterror;
                stream.on('data',  function acc(report) {trends.push(trendsValue(report)); });

                stream.on('error', function (err) {lasterror = err; });

                stream.on('end', function () {cb(lasterror, lasterror ? undefined : trends); });
            }

            return source instanceof Readable ?
                    streamCompute(source, cb, customdate) :
                    source.map(trendsValue);
        }

        // make public (chained) Trend function
        // which simply pushes an action and returns chain
        function makeChainedTrend(Trend) {
            return function (field, option) {
                var getter = prop(field);
                actions.push({name: trendname(getter), trendvalue: new Trend(getter, option)});
                return chain;
            };
        }

        chain = R.mapObj(makeChainedTrend)(Trends);

        chain.fromArray  = function (reports, customdate) {return compute(undefined, reports, customdate); };
        chain.fromStore  = function (store, cb, startdate) {return compute(cb, store.stream(startdate), store.customdate); };
        chain.formStream = function (stream, cb, customdate) {return compute(cb, stream, customdate); };

        return chain;
    };

    function init(Trends) {
        // first functions called by user when using HistoryTrend
        // then chained functions are called (see Chain imp)
        function makePublicTrend(Trend, key) {
            return function publicTrend(field, option) {
                return new Chain(Trends)[key](field, option);
            };
        }
        var trends = R.mapObjIndexed(makePublicTrend)(Trends);
        trends.name = function (desc) {
            var chain = new Chain(Trends);
            chain.id = desc.id;
            return chain;
        };
        Object.keys(require('./modules/flux/utils')).forEach(function (key) {
            trends[key] = require('./modules/flux/utils')[key];
        });
        trends.prop = prop;

        return trends;
    }

    return init({
        timeserie: TimeSerie,
        flux: Flux,
        fluxObj: FLuxObj,
        variationFlux: VariationFlux,
        transition: require('./modules/transition/transition'),
        count: Count
    });
}());