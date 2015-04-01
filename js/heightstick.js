#!/usr/bin/env node
/*jshint node:true */
'use strict';

require('./Collection.js');

var sntls = require('sntls'),
    Q = require('q'),
    DateIntervals = require('./DateIntervals.js'),
    AuthorsParser = require('./AuthorsParser.js'),
    ClocParser = require('./ClocParser.js'),
    argv = require('./Argv.js').create()
        .setFlagDescriptions(sntls.Collection.create({
            "help": "Displays this help"
        }))
        .setOptionDescriptions(sntls.Collection.create({
            "branch"    : "Branch being assessed. Defaults to 'master'.",
            "cloc-args" : "Argument list to be passed to CLOC.",
            "resolution": "Time sampling resolution. Can be 'week' or 'month'. Defaults to 'month'."
        })),
    gitRepo = require('./GitRepo.js').create()
        .setCurrentBranch(argv.getArgumentValue('branch') || 'master')
        .setClocArguments(argv.getArgumentValue('cloc-args') || '. --exclude-dir=node_modules'),
    dateIntervals,
    commitData = sntls.Tree.create();

if (argv.getArgumentValue('help')) {
    process.stdout.write(argv.toString());
} else {
    gitRepo.getFirstCommitDate()
        .then(function (firstCommitDate) {
            dateIntervals = DateIntervals.create(firstCommitDate, new Date(), argv.getArgumentValue('resolution') || 'month');
        })
        .then(function () {
            return dateIntervals.dateIntervalCollection
                .mapValuesAsync(function (/**DateInterval*/dateInterval) {
                    return gitRepo.getAuthorsBetween(dateInterval.startDate, dateInterval.endDate);
                });
        })
        .then(function (/**sntls.Collection*/authors) {
            authors
                .mapValues(function (authorsOutput) {
                    return AuthorsParser.parseTextOutput(authorsOutput);
                })
                .forEachItem(function (parsedAuthorsForDate, dateStr) {
                    commitData.setNode([dateStr, 'authors'].toPath(), parsedAuthorsForDate);
                });
        })
        .then(function () {
            return dateIntervals.dateIntervalCollection
                .mapValuesAsync(function (/**DateInterval*/dateInterval) {
                    return gitRepo.getClocAt(dateInterval.endDate);
                });
        })
        .then(function (/**sntls.Collection*/cloc) {
            cloc
                .mapValues(function (clocOutput) {
                    return ClocParser.parseCsvOutput(clocOutput);
                })
                .forEachItem(function (parsedClocForDate, dateStr) {
                    commitData.setNode([dateStr, 'cloc'].toPath(), parsedClocForDate);
                });
        })
        .then(function () {
            process.stdout.write(JSON.stringify(commitData.items, null, 2));
        });
}
