
/**
*
* return length of an array
*/

/*jslint node: true */

module.exports = function Count(getter) {
    'use strict';
    return function countArray(report) {
        return getter(report).length;
    };
};
