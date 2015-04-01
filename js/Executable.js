/* jshint node:true */
"use strict";

var exec = require('child_process').exec,
    troop = require('troop'),
    Q = require('q');

/**
 * @class
 * @extends troop.Base
 */
var Executable = troop.Base.extend()
    .addConstants(/** @lends Executable */{
        /**
         * @type {string}
         * @constant
         */
        filePath: undefined
    })
    .addMethods(/** @lends Executable# */{
        /**
         * Arguments get passed to the executable.
         * @returns {Q.Promise}
         */
        execute: function () {
            var that = this,
                deferred = Q.defer(),
                args = Array.prototype.slice.call(arguments),
                command = [this.filePath].concat(args).join(' ');

            console.info("running >", command);

            exec(command, function (err, stdout, stderr) {
                if (err) {
                    deferred.reject(stdout, stderr);
                } else {
                    deferred.resolve(stdout, stderr);
                }
            });

            return deferred.promise;
        }
    });

module.exports = Executable;
