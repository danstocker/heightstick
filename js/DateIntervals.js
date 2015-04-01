/* jshint node:true */
"use strict";

var dessert = require('dessert'),
    troop = require('troop'),
    sntls = require('sntls'),
    DateInterval = require('./DateInterval.js');

/**
 * @name DateIntervals.create
 * @function
 * @param {object|Array} [items]
 * @returns {DateIntervals}
 */

/**
 * @class
 * @extends troop.Base
 */
var DateIntervals = troop.Base.extend()
    .addConstants(/** @lends DateIntervals */{
        /**
         * @type {object}
         * @constant
         */
        dateIntervalResolutions: {
            week : 'week',
            month: 'month'
        }
    })
    .addPrivateMethods(/** @lends DateIntervals# */{
        /**
         * @param {Date} date
         * @returns {Date}
         * @private
         */
        _addWeek: function (date) {
            var result = new Date(date);
            result.setDate(date.getDate() + 7);
            return result;
        },

        /**
         * @param {Date} date
         * @returns {Date}
         * @private
         */
        _addMonth: function (date) {
            var result = new Date(date);
            result.setMonth(date.getMonth() + 1);
            return result;
        },

        /**
         * @param {Date} date
         * @returns {Date}
         * @private
         */
        _addUnit: function (date) {
            switch (this.resolution) {
            case this.dateIntervalResolutions.week:
                return this._addWeek(date);
            default:
            case this.dateIntervalResolutions.month:
                return this._addMonth(date);
            }
        },

        /** @private */
        _initializeDates: function () {
            var date = new Date(this.startDate),
                nextDate;

            while (+date < this.endDate) {
                nextDate = this._addUnit(date);
                this.dateIntervalCollection.setItem(+nextDate, DateInterval.create(date, nextDate));
                date = nextDate;
            }
        }
    })
    .addMethods(/** @lends DateIntervals# */{
        /**
         * @param {Date} startDate
         * @param {Date} endDate
         * @param {string} resolution
         */
        init: function (startDate, endDate, resolution) {
            dessert
                .isDate(startDate, "Invalid start date")
                .isDate(endDate, "Invalid end date")
                .assert(+startDate < +endDate, "Invalid date bounds")
                .isDateIntervalResolution(resolution, "Invalid resolution");

            /** @type {sntls.Collection} */
            this.dateIntervalCollection = sntls.Collection.create();

            /** @type {Date} */
            this.startDate = startDate;

            /** @type {Date} */
            this.endDate = endDate;

            /** @type {string} */
            this.resolution = resolution;

            this._initializeDates();
        }
    });

dessert.addTypes(/** @lends dessert */{
    /** @param {string} expr */
    isDateIntervalResolution: function (expr) {
        return expr && DateIntervals.dateIntervalResolutions[expr] === expr;
    }
});

module.exports = DateIntervals;
