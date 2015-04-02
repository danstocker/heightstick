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
         * TODO: Add a more intelligent estimation of team size based on commit distribution.
         * @param {object} authors
         * @returns {number}
         * @private
         */
        _getTeamSize: function (authors) {
            return sntls.Collection.create(authors)
                .getKeyCount();
        },

        /**
         * @param {object} cloc
         * @returns {Object}
         * @private
         */
        _getNetCodeSize: function (cloc) {
            return sntls.Tree.create(cloc)
                .queryValues('|>code'.toQuery())
                .reduce(function (current, previous) {
                    return current + previous;
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
                .reduce(function (current, previous) {
                    return current + previous;
                }, 0);
        },

        /**
         * @param {object} cloc
         * @returns {Object}
         * @private
         */
        _getDocumentationRatio: function (cloc) {
            var clocByLanguage = sntls.Collection.create(cloc),
                languageCount = clocByLanguage.getKeyCount();

            return clocByLanguage
                .mapValues(function (clocForLanguage) {
                    var grossCodeSize = clocForLanguage.code + clocForLanguage.comment + clocForLanguage.blank;
                    return clocForLanguage.comment / grossCodeSize;
                })
                .getValues()
                .reduce(function (current, previous) {
                    return current + previous;
                }, 0);
        },

        /**
         * @returns {sntls.Collection}
         * @private
         */
        _getFlattenedStats: function () {
            var that = this;
            return this.statsLookup.toCollection()
                .mapValues(function (statsForDate, dateStr) {
                    return {
                        date              : dateStr,
                        teamSize          : that._getTeamSize(statsForDate.authors),
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
