#!/usr/bin/env node
/*jshint node:true */
'use strict';

require('./Collection.js');

var giant = require('giant-cli-tools'),
    Q = require('q'),
    DateIntervals = require('./DateIntervals.js'),
    AuthorsParser = require('./AuthorsParser.js'),
    ClocParser = require('./ClocParser.js'),
    argv = require('./Argv.js').create()
        .setFlagDescriptions(giant.Collection.create({
            "help": "Displays this help"
        }))
        .setOptionDescriptions(giant.Collection.create({
            "branch"   : "Branch being assessed. Defaults to 'master'.",
            "cloc-args": "Argument list to be passed to CLOC.",
            "format"   : "Output format. Either 'json' (default), 'csv', or 'raw-json'.",
            "sampling" : "Date sampling resolution. Can be 'weekly', 'biweekly', or 'monthly' (default)."
        })),
    gitRepo = require('./GitRepo.js').create()
        .setCurrentBranch(argv.getArgumentValue('branch') || 'master')
        .setClocArguments(argv.getArgumentValue('cloc-args') || '. --exclude-dir=node_modules'),
    growthStats = require('./GrowthStats.js').create(),
    firstCommitDate, lastCommitDate,
    dateIntervals;

if (argv.getArgumentValue('help')) {
    process.stdout.write(argv.toString());
} else {
    gitRepo.getFirstCommitDate()
        .then(function (date) {
            firstCommitDate = date;
        })
        .then(function () {
            return gitRepo.getLastCommitDate();
        })
        .then(function (date) {
            lastCommitDate = date;
        })
        .then(function () {
            dateIntervals = DateIntervals.create(
                firstCommitDate,
                lastCommitDate,
                argv.getArgumentValue('sampling') || 'monthly');
        })
        .then(function () {
            return dateIntervals.dateIntervalCollection
                .mapValuesAsync(function (/**DateInterval*/dateInterval) {
                    return gitRepo.getAuthorsBetween(dateInterval.startDate, dateInterval.endDate);
                });
        })
        .then(function (/**giant.Collection*/authors) {
            authors
                .mapValues(function (authorsOutput) {
                    return AuthorsParser.parseTextOutput(authorsOutput);
                })
                .forEachItem(function (parsedAuthorsForDate, dateStr) {
                    growthStats.addAuthors(dateStr, parsedAuthorsForDate);
                });
        })
        .then(function () {
            return dateIntervals.dateIntervalCollection
                .mapValuesAsync(function (/**DateInterval*/dateInterval) {
                    return gitRepo.getClocAt(dateInterval.endDate);
                });
        })
        .then(function (/**giant.Collection*/cloc) {
            cloc
                .mapValues(function (clocOutput) {
                    return ClocParser.parseCsvOutput(clocOutput);
                })
                .forEachItem(function (parsedClocForDate, dateStr) {
                    growthStats.addCloc(dateStr, parsedClocForDate);
                });
        })
        .then(function () {
            switch (argv.getArgumentValue('format')) {
            case 'csv':
                process.stdout.write(growthStats.getFlattenedCsv());
                break;

            default:
            case 'json':
                process.stdout.write(growthStats.getFlattenedJson());
                break;

            case 'raw-json':
                process.stdout.write(growthStats.getRawJson());
                break;

            }
        });
}
