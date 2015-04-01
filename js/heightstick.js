#!/usr/bin/env node
/*jshint node:true */
'use strict';

var argv = require('./Argv.js').create(),
    DateIntervals = require('./DateIntervals.js'),
    gitRepo = require('./GitRepo.js').create()
        .setCurrentBranch(argv.getArgumentValue('branch') || 'master')
        .setClocArguments(argv.getArgumentValue('cloc-args') || '. --exclude-dir=node_modules');

gitRepo.getFirstCommitDate()
    .then(function (firstCommitDate) {
        DateIntervals.create(firstCommitDate, new Date(), 'month');
    }, function () {
        console.error("getting first commit failed");
    });

//
//gitRepo.getAuthorsBetween(new Date(+new Date() - 31 * 24 * 3600 * 1000), new Date())
//    .then(function (stdout) {
//        console.log("authors ok", stdout);
//    }, function (stdout) {
//        console.error("authors error", stdout);
//    })
//    .then(function () {
//        return gitRepo.getClocAt(new Date());
//    })
//    .then(function (stdout) {
//        console.log("cloc ok", stdout);
//    }, function (stdout) {
//        console.error("cloc error", stdout);
//    });
