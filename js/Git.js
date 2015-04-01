/* jshint node:true */
"use strict";

var Executable = require('./Executable.js');

/**
 * TODO: Add parse-output.
 * @class
 * @extends troop.Base
 */
var Git = Executable.extend()
    .addConstants(/** @lends Git */{
        /**
         * @type {string}
         * @constant
         */
        filePath: 'git'
    });

module.exports = Git;
