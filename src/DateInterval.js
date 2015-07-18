/* jshint node:true */
"use strict";

var giant = require('giant-namespace');

require('giant-oop');

/**
 * @name DateInterval.create
 * @function
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {DateInterval}
 */

/**
 * @class
 * @extends giant.Base
 */
var DateInterval = giant.Base.extend()
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
