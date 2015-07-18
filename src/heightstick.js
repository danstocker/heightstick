#!/usr/bin/env node
/*jshint node:true */
'use strict';

require('./Collection.js');

var giant = require('giant-data'),
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
            console.error("*** first commit date", date);

            firstCommitDate = date;
        })
        .then(function () {
            return gitRepo.getLastCommitDate();
        })
        .then(function (date) {
            console.error("*** last commit date", date);

            lastCommitDate = date;
        })
        .then(function () {
            console.error("*** obtaining date intervals");

            dateIntervals = DateIntervals.create(
                firstCommitDate,
                lastCommitDate,
                argv.getArgumentValue('sampling') || 'monthly');

            console.error("*** date interval count", dateIntervals.dateIntervalCollection.getKeyCount());
        })
        .then(function () {
            console.error("*** getting authors for each interval");

            return dateIntervals.dateIntervalCollection
                .mapValuesAsync(function (/**DateInterval*/dateInterval) {
                    return gitRepo.getAuthorsBetween(dateInterval.startDate, dateInterval.endDate);
                });
        })
        .then(function (/**giant.Collection*/authors) {
            console.error("*** parsing author information");

            authors
                .mapValues(function (authorsOutput) {
                    return AuthorsParser.parseTextOutput(authorsOutput);
                })
                .forEachItem(function (parsedAuthorsForDate, dateStr) {
                    growthStats.addAuthors(dateStr, parsedAuthorsForDate);
                });
        })
        .then(function () {
            console.error("*** getting CLOC info");

            return dateIntervals.dateIntervalCollection
                .mapValuesAsync(function (/**DateInterval*/dateInterval) {
                    return gitRepo.getClocAt(dateInterval.endDate);
                });
        })
        .then(function (/**giant.Collection*/cloc) {
            console.error("*** processing CLOC info");

            cloc
                .mapValues(function (clocOutput) {
                    return ClocParser.parseCsvOutput(clocOutput);
                })
                .forEachItem(function (parsedClocForDate, dateStr) {
                    growthStats.addCloc(dateStr, parsedClocForDate);
                });
        })
        .then(function () {
            console.error("*** generating output");

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
