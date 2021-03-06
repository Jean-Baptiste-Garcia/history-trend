/*jslint node: true */

module.exports = (function () {
    'use strict';
    var Readable = require('stream').Readable,
        R = require('ramda'),
        prop = require('./modules/prop/prop'),
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
            actions = [],
            datefilter;

        function catalogTransform() {
            // 1) reverse catalog for time descendant sort
            // 2) apply datefilter
            // 3) reverse to come back to ascendant sort
            return datefilter
                ? function (o) {return datefilter(R.reverse(o)).reverse(); }
                : function (o) {return o; };
        }

        function compute(cb, source, customdate) {
            var dategetter = prop(customdate || 'date'),
                datekey = trendname(dategetter, 'date'), // for anonymous function
                namedactions = uniqueTrendNames(actions);

            function trendsValue(report) {
                var trendItem = {};
                trendItem[datekey] = dategetter(report);
                namedactions.forEach(function (action) {
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

            // Reinitialize trend value for each computation
            namedactions.forEach(function (action) {
                action.trendvalue = action.trend(action.getter, action.option);
            });

            return source instanceof Readable
                    ? streamCompute(source, cb, customdate)
                    : catalogTransform()(source).map(trendsValue);
        }

        function catalogFromStore(store, cb) {
            return store.catalog(cb, {transform: catalogTransform()});
        }

        function fromStore(store, cb, startdate) {
            store.stream(function (err, stream) {
                if (err) {return cb(err); }
                compute(cb, stream, store.customdate);
            },
                {transform: catalogTransform(), startdate: startdate});
        }

        function onDate(w) {
            datefilter = w;
            return chain;
        }

        // make public (chained) Trend function
        // which simply pushes an action and returns chain
        function makeChainedTrend(Trend) {
            return function (field, option) {
                var getter = prop(field);
                actions.push({name: trendname(getter), trend: Trend, getter: getter, option: option});
                return chain;
            };
        }

        chain = R.mapObj(makeChainedTrend)(Trends);

        chain.fromArray  = function (reports, customdate) {return compute(undefined, reports, customdate); };
        chain.fromStore  = fromStore;
        chain.whereDate = onDate;
        chain.catalog = catalogFromStore;
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
        timeserie:      require('./modules/timeserie/timeserie'),
        flux:           require('./modules/flux/flux'),
        fluxObj:        require('./modules/flux/fluxObj'),
        variationFlux:  require('./modules/flux/variationFLux'),
        transition:     require('./modules/transition/transition'),
        count:          require('./modules/count/count')
    });
}());