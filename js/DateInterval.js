/* jshint node:true */
"use strict";

var troop = require('troop');

/**
 * @name DateInterval.create
 * @function
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {DateInterval}
 */

/**
 * @class
 * @extends troop.Base
 */
var DateInterval = troop.Base.extend()
    .addMethods(/** @lends DateInterval# */{
        /**
         * @param {Date} startDate
         * @param {Date} endDate
         * @ignore
         */
        init: function(startDate, endDate) {
            /** @type {Date} */
            this.startDate = startDate;

            /** @type {Date} */
            this.endDate = endDate;
        }
    });

module.exports = DateInterval;
