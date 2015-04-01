/* jshint node:true */
"use strict";

var troop = require('troop'),
    sntls = require('sntls');

/**
 * @class
 * @extends troop.Base
 */
var AuthorsParser = troop.Base.extend()
    .addConstants(/** @lends AuthorsParser */{
        /**
         * @type {RegExp}
         * @constant
         */
        RE_AUTHORS_LINE: /\d+\s+Author:\s+[^<]+<[^>]+>/g,

        /**
         * @type {RegExp}
         * @constant
         */
        RE_AUTHORS_ROW_EXTRACTOR: /(\d+)\s+Author:\s+([^<]+)<([^>]+)>/
    })
    .addMethods(/** @lends AuthorsParser */{
        /**
         * Parses authors output of git log, with commit counts.
         * @example
         *    1 Author: Dan Stocker <dan@kwaia.com>
         * @param {string} authorsOutput
         * @returns {object}
         */
        parseTextOutput: function (authorsOutput) {
            var that = this,
                lines = authorsOutput.match(that.RE_AUTHORS_LINE);

            return lines ?
                lines.toCollection()
                    .mapValues(function (line) {
                        var row = line.match(that.RE_AUTHORS_ROW_EXTRACTOR);
                        return {
                            commits: parseInt(row[1], 10),
                            name   : row[2],
                            email  : row[3]
                        };
                    })
                    .mapKeys(function (author) {
                        return author.email;
                    })
                    .items :
            {};
        }
    });

module.exports = AuthorsParser;
