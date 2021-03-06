/* jshint node:true */
"use strict";

var giant = require('giant-namespace');

require('giant-oop');
require('giant-data');

/**
 * @class
 * @extends giant.Base
 */
var ClocParser = giant.Base.extend()
    .addConstants(/** @lends ClocParser */{
        /**
         * @type {RegExp}
         * @constant
         */
        RE_CLOC_CSV_EXTRACTOR: /(?:[\w\d]+,){4}[\w\d]+/g
    })
    .addMethods(/** @lends ClocParser */{
        /**
         * Parses CSV output of Cloc.
         * @example
         * 12 text files.
         * 12 unique files.
         * 2 files ignored.
         *
         * files,language,blank,comment,code,"http://cloc.sourceforge.net v 1.62  T=0.03 s (339.5 files/s, 24374.6 lines/s)"
         * 10,Javascript,75,207,436
         * @param {string} clocOutput
         * @returns {object}
         */
        parseCsvOutput: function (clocOutput) {
            var csvLines = clocOutput.match(this.RE_CLOC_CSV_EXTRACTOR),
                columnIndexByFieldName = csvLines && csvLines[0].split(',')
                    .toStringDictionary()
                    .reverse();

            return csvLines ?
                csvLines.slice(1)
                    .toCollection()

                    // splitting up lines to rows and converting numeric fields to numbers
                    .mapValues(function (csvLine) {
                        return csvLine.split(',')
                            .map(function (csvField) {
                                return parseInt(csvField, 10) || csvField;
                            });
                    })

                    // keying by language
                    .mapKeys(function (csvRow) {
                        return csvRow[columnIndexByFieldName.getItem('language')];
                    })

                    // turning csv rows into json rows
                    .mapValues(function (csvRow) {
                        return columnIndexByFieldName.combineWith(csvRow.toDictionary()).items;
                    })
                    .items :
            {};
        }
    });

module.exports = ClocParser;
