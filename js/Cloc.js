/* jshint node:true */
"use strict";

var Executable = require('./Executable.js');

/**
 * TODO: Add parse-output.
 * @class
 * @extends troop.Base
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
