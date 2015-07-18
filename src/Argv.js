/* jshint node:true */
"use strict";

var giant = require('giant-namespace'),
    argv = process.argv;

require('giant-oop');
require('giant-data');

/**
 * @class
 * @extends giant.Base
 */
var Argv = giant.Base.extend()
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
         * @type {giant.Collection}
         * @constant
         */
        args: giant.Collection.create(argv.slice(2))
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
         * @returns {giant.Collection}
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

            /** @type {giant.Collection} */
            this.flagDescriptions = giant.Collection.create();

            /** @type {giant.Collection} */
            this.optionDescriptions = giant.Collection.create();

            /** @type {giant.Collection} */
            this.parsedArguments = this._parseArguments();
        },

        /**
         * @param {string} argumentName
         * @returns {string|boolean}
         */
        getArgumentValue: function (argumentName) {
            return this.parsedArguments.getItem(argumentName);
        },

        /**
         * @param {giant.Collection} flagDescriptions
         * @returns {Argv}
         */
        setFlagDescriptions: function (flagDescriptions) {
            this.flagDescriptions = flagDescriptions;
            return this;
        },

        /**
         * @param {giant.Collection} optionDescriptions
         * @returns {Argv}
         */
        setOptionDescriptions: function (optionDescriptions) {
            this.optionDescriptions = optionDescriptions;
            return this;
        },

        /** @returns {string} */
        toString: function () {
            return [
                "Heightstick Codebase Assesment Tool http://npmjs.org/heightstick",
                "Commands & Flags:",
                this.flagDescriptions
                    .mapValues(function (description, argumentName) {
                        return " " + argumentName + " : " + description;
                    })
                    .getValues()
                    .join('\n'),
                "",
                "Options:",
                this.optionDescriptions
                    .mapValues(function (description, argumentName) {
                        return " --" + argumentName + " : " + description;
                    })
                    .getValues()
                    .join('\n'),
                ""
            ].join('\n');
        }
    });

module.exports = Argv;
