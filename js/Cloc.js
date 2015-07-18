/* jshint node:true */
"use strict";

var Executable = require('./Executable.js');

/**
 * @class
 * @extends Executable
 */
var Cloc = Executable.extend()
    .addConstants(/** @lends Cloc */{
        /**
         * @type {string}
         * @constant
         */
        filePath: 'cloc'
    });

module.exports = Cloc;
