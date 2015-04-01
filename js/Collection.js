/* jshint node:true */
"use strict";

var sntls = require('sntls'),
    Q = require('q');

sntls.Collection.addMethods(/** @lends sntls.Collection# */{
    /**
     * Same as Collection.mapValues, but asynchronous. Handler is expected to return a Q promise.
     * TODO: Add test.
     * @param {function} handler
     * @returns {Q.Promise}
     */
    mapValuesAsync: function (handler) {
        var sourceItems = sntls.Utils.shallowCopy(this.items),
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
                deferred.resolve(sntls.Collection.create(resultItems));
            }
        }());

        return deferred.promise;
    }
});
