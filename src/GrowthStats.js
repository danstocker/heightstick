/* jshint node:true */
"use strict";

var giant = require('giant-namespace');

require('giant-oop');
require('giant-data');

/**
 * @name GrowthStats.create
 * @function
 * @returns {GrowthStats}
 */

/**
 * @class
 * @extends giant.Base
 */
var GrowthStats = giant.Base.extend()
    .addPrivateMethods(/** @lends GrowthStats# */{
        /**
         * @param {object} authors
         * @returns {number}
         * @private
         */
        _getCommitterCount: function (authors) {
            return giant.Collection.create(authors)
                .getKeyCount();
        },

        /**
         * @param {object} authors
         * @returns {object}
         * @private
         */
        _getCommitStats: function (authors) {
            var authorLookup = giant.Collection.create(authors),
                authorCount = authorLookup.getKeyCount(),
                medianIndex = Math.min(Math.ceil(authorCount / 2), authorCount - 1),

            // summing commit count
                totalCommitCount = authorCount && authorLookup
                    .getValues()
                    .reduce(function (previous, current) {
                        return previous + current.commits;
                    }, 0),

            // getting median commit count
                medianCommitCount = authorCount && authorLookup
                    .collectProperty('commits')
                    .getValues()
                    .sort(function (a, b) {return a > b ? 1 : a < b ? -1 : 0;})
                    [medianIndex];

            return {
                totalCommitCount  : totalCommitCount,
                medianCommitCount : medianCommitCount,
                normalizedTeamSize: totalCommitCount && totalCommitCount / medianCommitCount
            };
        },

        /**
         * @param {object} cloc
         * @returns {Object}
         * @private
         */
        _getNetCodeSize: function (cloc) {
            return giant.Tree.create(cloc)
                .queryValues('|>code'.toQuery())
                .reduce(function (previous, current) {
                    return previous + current;
                }, 0);
        },

        /**
         * @param {object} cloc
         * @returns {Object}
         * @private
         */
        _getGrossCodeSize: function (cloc) {
            return giant.Collection.create(cloc)
                .mapValues(function (clocForLanguage) {
                    return clocForLanguage.code + clocForLanguage.comment + clocForLanguage.blank;
                })
                .getValues()
                .reduce(function (previous, current) {
                    return previous + current;
                }, 0);
        },

        /**
         * @param {object} cloc
         * @returns {Object}
         * @private
         */
        _getDocumentationRatio: function (cloc) {
            var clocByLanguage = giant.Collection.create(cloc),
                fullCloc = clocByLanguage

                    // calculating net & gross for each language
                    .mapValues(function (clocForLanguage) {
                        return {
                            net  : clocForLanguage.comment,
                            gross: clocForLanguage.code +
                                   clocForLanguage.comment +
                                   clocForLanguage.blank
                        };
                    })

                    // getting overall net & gross cloc
                    .getValues()
                    .reduce(function (previous, current) {
                        return {
                            net  : previous.net + current.net,
                            gross: previous.gross + current.gross
                        };
                    }, {net: 0, gross: 0});

            // returning net / gross ratio
            return fullCloc.net && fullCloc.net / fullCloc.gross;
        },

        /**
         * @returns {giant.Collection}
         * @private
         */
        _getFlattenedStats: function () {
            var that = this;
            return this.statsLookup.toCollection()
                .mapValues(function (statsForDate, dateStr) {
                    var commitStats = that._getCommitStats(statsForDate.authors);

                    return {
                        date              : dateStr.substr(0, 10),
                        committerCount    : that._getCommitterCount(statsForDate.authors),
                        totalCommitCount  : commitStats.totalCommitCount,
                        medianCommitCount : commitStats.medianCommitCount,
                        normalizedTeamSize: commitStats.normalizedTeamSize,
                        netCodeSize       : that._getNetCodeSize(statsForDate.cloc),
                        grossCodeSize     : that._getGrossCodeSize(statsForDate.cloc),
                        documentationRatio: that._getDocumentationRatio(statsForDate.cloc)
                    };
                });
        }
    })
    .addMethods(/** @lends GrowthStats# */{
        /** @ignore */
        init: function () {
            /** @type {giant.Tree} */
            this.statsLookup = giant.Tree.create();
        },

        /**
         * @param {string} dateStr
         * @param {object} authorsJson
         * @returns {GrowthStats}
         */
        addAuthors: function (dateStr, authorsJson) {
            this.statsLookup.setNode([dateStr, 'authors'].toPath(), authorsJson);
            return this;
        },

        /**
         * @param {string} dateStr
         * @param {object} clocJson
         * @returns {GrowthStats}
         */
        addCloc: function (dateStr, clocJson) {
            this.statsLookup.setNode([dateStr, 'cloc'].toPath(), clocJson);
            return this;
        },

        /**
         * @returns {string}
         */
        getRawJson: function () {
            return JSON.stringify(this.statsLookup.items, null, 2) + '\n';
        },

        /**
         * @returns {string}
         */
        getFlattenedJson: function () {
            return JSON.stringify(this._getFlattenedStats().items, null, 2) + '\n';
        },

        /**
         * @returns {string}
         */
        getFlattenedCsv: function () {
            var flattenedStats = this._getFlattenedStats(),
                csvBuffer = [
                    // CSV header
                    giant.Hash.create(flattenedStats.getFirstValue()).getKeys()
                ];

            return csvBuffer.concat(flattenedStats
                    .mapValues(function (statsRecord) {
                        return giant.Collection.create(statsRecord)
                            .mapValues(function (statsField) {
                                switch (typeof statsField) {
                                case 'string':
                                    // escaping double quotes in strings
                                    return '"' + statsField.replace('"', '""') + '"';
                                default:
                                    return '"' + statsField + '"';
                                }
                            })
                            .getValues()
                            .join(',');
                    })
                    .getValues())
                       .join('\n') + '\n';
        }
    });

module.exports = GrowthStats;
