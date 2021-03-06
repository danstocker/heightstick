/* jshint node:true */
"use strict";

var giant = require('giant-namespace'),
    Git = require('./Git.js'),
    Cloc = require('./Cloc.js');

require('giant-oop');
require('giant-data');

/**
 * @name GitRepo.create
 * @function
 * @returns {GitRepo}
 */

/**
 * @class
 * @extends giant.Base
 */
var GitRepo = giant.Base.extend()
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
            var gitArgs = ['log --format="%ci"', this.currentBranch, ' | tail -n 1;'].join(' ');
            return Git.execute(gitArgs)
                .then(function (isoDateStr) {
                    return new Date(isoDateStr);
                });
        },

        /**
         * Retrieves the date for the last commit on the current repo / branch.
         * @returns {Q.Promise}
         */
        getLastCommitDate: function () {
            var gitArgs = ['log --format="%ci"', this.currentBranch, ' -n 1;'].join(' ');
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
                'checkout --force `git rev-list -n 1 --before="', date.toISOString(), '" ', this.currentBranch, '`'
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
                    console.error("checked out >", that.currentBranch, '@', date.toISOString());
                    return Cloc.execute([that.clocArguments, '--csv'].join(' '));
                }, function () {
                    console.error("checkout failed >", that.currentBranch, '@', date.toISOString());
                });
        }
    });

module.exports = GitRepo;
