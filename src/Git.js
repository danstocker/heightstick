/* jshint node:true */
"use strict";

var Executable = require('./Executable.js');

/**
 * @class
 * @extends Executable
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
