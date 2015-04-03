/* jshint node:true */
"use strict";

var troop = require('troop'),
    sntls = require('sntls');

/**
 * @name GrowthStats.create
 * @function
 * @returns {GrowthStats}
 */

/**
 * @class
 * @extends troop.Base
 */
var GrowthStats = troop.Base.extend()
    .addPrivateMethods(/** @lends GrowthStats# */{
        /**
         * @param {object} authors
         * @returns {number}
         * @private
         */
        _getCommitterCount: function (authors) {
            return sntls.Collection.create(authors)
                .getKeyCount();
        },

        /**
         * @param {object} authors
         * @returns {object}
         * @private
         */
        _getCommitStats: function (authors) {
            var authorLookup = sntls.Collection.create(authors),
                authorCount = authorLookup.getKeyCount(),

            // summing commit count
                totalCommitCount = authorLookup
                    .getValues()
                    .reduce(function (previous, current) {
                        return previous + current.commits;
                    }, 0),

            // getting median commit count
                medianCommitCount = authorLookup
                    .collectProperty('commits')
                    .getValues()
                    .sort(function (a, b) {return a > b ? 1 : a < b ? -1 : 0;})
                    [Math.ceil(authorCount / 2)];

            return {
                totalCommitCount  : totalCommitCount,
                medianCommitCount : medianCommitCount,
                normalizedTeamSize: totalCommitCount / medianCommitCount
            };
        },

        /**
         * @param {object} cloc
         * @returns {Object}
         * @private
         */
        _getNetCodeSize: function (cloc) {
            return sntls.Tree.create(cloc)
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
            return sntls.Collection.create(cloc)
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
            var clocByLanguage = sntls.Collection.create(cloc),
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
            return fullCloc.net / fullCloc.gross;
        },

        /**
         * @returns {sntls.Collection}
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
            /** @type {sntls.Tree} */
            this.statsLookup = sntls.Tree.create();
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
                    sntls.Hash.create(flattenedStats.getFirstValue()).getKeys()
                ];

            return csvBuffer.concat(flattenedStats
                    .mapValues(function (statsRecord) {
                        return sntls.Collection.create(statsRecord)
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
