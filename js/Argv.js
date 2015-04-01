/* jshint node:true */
"use strict";

var troop = require('troop'),
    sntls = require('sntls'),
    argv = process.argv;

console.log(JSON.stringify(argv, null, 2));

/**
 * @class
 * @extends troop.Base
 */
var Argv = troop.Base.extend()
    .setInstanceMapper(function () {
        return 'singleton';
    })
    .addConstants(/** @lends Argv */{
        /**
         * @type {RegExp}
         * @constant
         */
        RE_OPTION_EXTRACTOR: /--([^=]+)=(.*)/,

        /**
         * @type {string}
         * @constant
         */
        executablePath: argv[1],

        /**
         * @type {sntls.Collection}
         * @constant
         */
        args: sntls.Collection.create(argv.slice(2))
    })
    .addPrivateMethods(/** @lends Argv */{
        /**
         * @param {string} argument
         * @returns {Array}
         * @private
         */
        _extractKeyValuePair: function (argument) {
            var option = this.RE_OPTION_EXTRACTOR.exec(argument);

            if (option && option.length === 3) {
                // argument is option
                return option.slice(1);
            } else {
                // argument is switch
                return [argument, true];
            }
        },

        /**
         * Creates an lookup object based on the argument list.
         * @returns {sntls.Collection}
         * @private
         */
        _parseArguments: function () {
            return this.args
                .mapValues(this._extractKeyValuePair)
                .mapKeys(function (option) {
                    return option[0];
                })
                .mapValues(function (option) {
                    return option[1];
                });
        }
    })
    .addMethods(/** @lends Argv */{
        /** @ignore */
        init: function () {
            this.elevateMethod('_extractKeyValuePair');

            /** @type {sntls.Collection} */
            this.parsedArguments = this._parseArguments();
        },

        /**
         * @param {string} argumentName
         * @returns {string|boolean}
         */
        getArgumentValue: function (argumentName) {
            return this.parsedArguments.getItem(argumentName);
        }
    });

module.exports = Argv;
