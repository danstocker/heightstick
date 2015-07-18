/* jshint node:true */
"use strict";

var giant = require('giant-namespace'),
    Q = require('q');

require('giant-data');

giant.Collection.addMethods(/** @lends giant.Collection# */{
    /**
     * Same as Collection.mapValues, but asynchronous. Handler is expected to return a Q promise.
     * TODO: Add test.
     * @param {function} handler
     * @returns {Q.Promise}
     */
    mapValuesAsync: function (handler) {
        var sourceItems = giant.Utils.shallowCopy(this.items),
            keys = Object.keys(sourceItems),
            resultItems = {},
            deferred = Q.defer(),
            i = 0, key;

        (function next() {
            if (i < keys.length) {
                key = keys[i];
                handler(sourceItems[key], key)
                    .then(function (mappedItem) {
                        resultItems[key] = mappedItem;
                        next();
                    });
                i++;
            } else {
                deferred.resolve(giant.Collection.create(resultItems));
            }
        }());

        return deferred.promise;
    }
});
