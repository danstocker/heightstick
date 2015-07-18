/* jshint node:true */
"use strict";

var giant = require('giant-namespace'),
    DateInterval = require('./DateInterval.js');

require('giant-assertion');
require('giant-oop');
require('giant-data');

/**
 * @name DateIntervals.create
 * @function
 * @param {object|Array} [items]
 * @returns {DateIntervals}
 */

/**
 * @class
 * @extends giant.Base
 */
var DateIntervals = giant.Base.extend()
    .addConstants(/** @lends DateIntervals */{
        /**
         * @type {object}
         * @constant
         */
        dateIntervalResolutions: {
            weekly  : 'weekly',
            biweekly: 'biweekly',
            monthly : 'monthly'
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
        _addTwoWeeks: function (date) {
            var result = new Date(date);
            result.setDate(date.getDate() + 14);
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
            switch (this.sampling) {
            case this.dateIntervalResolutions.weekly:
                return this._addWeek(date);
            case this.dateIntervalResolutions.biweekly:
                return this._addTwoWeeks(date);
            default:
            case this.dateIntervalResolutions.monthly:
                return this._addMonth(date);
            }
        },

        /** @private */
        _initializeDates: function () {
            var date = new Date(this.startDate),
                nextDate;

            while (+date < +this.endDate) {
                nextDate = this._addUnit(date);
                this.dateIntervalCollection.setItem(nextDate.toISOString(), DateInterval.create(date, nextDate));
                date = nextDate;
            }
        }
    })
    .addMethods(/** @lends DateIntervals# */{
        /**
         * @param {Date} startDate
         * @param {Date} endDate
         * @param {string} sampling
         */
        init: function (startDate, endDate, sampling) {
            giant
                .isDate(startDate, "Invalid start date")
                .isDate(endDate, "Invalid end date")
                .assert(+startDate < +endDate, "Invalid date bounds")
                .isDateSamplingResolution(sampling, "Invalid sampling resolution");

            /** @type {giant.Collection} */
            this.dateIntervalCollection = giant.Collection.create();

            /** @type {Date} */
            this.startDate = startDate;

            /** @type {Date} */
            this.endDate = endDate;

            /** @type {string} */
            this.sampling = sampling;

            this._initializeDates();
        }
    });

giant.addTypes(/** @lends giant */{
    /** @param {string} expr */
    isDateSamplingResolution: function (expr) {
        return expr && DateIntervals.dateIntervalResolutions[expr] === expr;
    }
});

module.exports = DateIntervals;
