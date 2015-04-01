/* jshint node:true */
"use strict";

var troop = require('troop'),
    Git = require('./Git.js'),
    Cloc = require('./Cloc.js');

/**
 * @name GitRepo.create
 * @function
 * @returns {GitRepo}
 */

/**
 * @class
 * @extends troop.Base
 */
var GitRepo = troop.Base.extend()
    .addMethods(/** @lends GitRepo# */{
        /** @ignore */
        init: function () {

            /** @type {string} */
            this.currentBranch = 'master';

            /** @type {string} */
            this.clocArguments = '.';
        },

        /**
         * @param {string} currentBranch
         * @returns {GitRepo}
         */
        setCurrentBranch: function (currentBranch) {
            this.currentBranch = currentBranch;
            return this;
        },

        /**
         * @param {string} clocArguments
         * @returns {GitRepo}
         */
        setClocArguments: function (clocArguments) {
            this.clocArguments = clocArguments;
            return this;
        },

        /**
         * Retrieves the date for the first commit on the current repo / branch.
         * @returns {Q.Promise}
         */
        getFirstCommitDate: function () {
            var gitArgs = ['log --format="%ci"', this.currentBranch, '| tail -n 1;'].join(' ');
            return Git.execute(gitArgs)
                .then(function (isoDateStr) {
                    return new Date(isoDateStr);
                });
        },

        /**
         * Retrieves list of authors for commits between the specified dates.
         * Includes commit count for each author listed.
         * @param {Date} startDate
         * @param {Date} endDate
         * @returns {Q.Promise}
         */
        getAuthorsBetween: function (startDate, endDate) {
            var gitArgs = [
                'log --after="', startDate.toISOString(),
                '" --before="', endDate.toISOString(),
                '" ', this.currentBranch, ' | grep Author: | sort | uniq -c'
            ].join('');

            return Git.execute(gitArgs);
        },

        /**
         * Checks out repo at specified date.
         * @param {Date} date
         * @returns {Q.Promise}
         */
        checkoutAt: function (date) {
            var gitArgs = [
                'checkout `git rev-list -n 1 --before="', date.toISOString(), '" ', this.currentBranch, '`'
            ].join('');

            return Git.execute(gitArgs);
        },

        /**
         * Gets CLOC results for current repo at specified date.
         * @param {Date} date
         */
        getClocAt: function (date) {
            var that = this;
            return this.checkoutAt(date)
                .then(function () {
                    console.info("checked out >", that.currentBranch, '@', date.toISOString());
                    return Cloc.execute([that.clocArguments, '--csv'].join(' '));
                }, function () {
                    console.error("checkout failed >", that.currentBranch, '@', date.toISOString());
                });
        }
    });

module.exports = GitRepo;
