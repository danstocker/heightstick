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
    .addMethods(/** @lends GrowthStats */{
        /** @ignore */
        init: function () {
            /** @type {sntls.Tree} */
            this.statStore = sntls.Tree.create();
        },

        /**
         * @param {string} dateStr
         * @param {object} authorsJson
         * @returns {GrowthStats}
         */
        addAuthors: function (dateStr, authorsJson) {
            this.statStore.setNode([dateStr, 'authors'].toPath(), authorsJson);
            return this;
        },

        /**
         * @param {string} dateStr
         * @param {object} clocJson
         * @returns {GrowthStats}
         */
        addCloc: function (dateStr, clocJson) {
            this.statStore.setNode([dateStr, 'cloc'].toPath(), clocJson);
            return this;
        }
    });

module.exports = GrowthStats;
