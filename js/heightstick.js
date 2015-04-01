#!/usr/bin/env node
/*jshint node:true */
'use strict';

require('./Collection.js');

var sntls = require('sntls'),
    Q = require('q'),
    DateIntervals = require('./DateIntervals.js'),
    AuthorsParser = require('./AuthorsParser.js'),
    ClocParser = require('./ClocParser.js'),
    argv = require('./Argv.js').create(),
    gitRepo = require('./GitRepo.js').create()
        .setCurrentBranch(argv.getArgumentValue('branch') || 'master')
        .setClocArguments(argv.getArgumentValue('cloc-args') || '. --exclude-dir=node_modules'),
    dateIntervals,
    commitData = sntls.Tree.create();

gitRepo.getFirstCommitDate()
    .then(function (firstCommitDate) {
        dateIntervals = DateIntervals.create(firstCommitDate, new Date(), 'month');

        return dateIntervals.dateIntervalCollection
            .mapValuesAsync(function (/**DateInterval*/dateInterval) {
                return gitRepo.getAuthorsBetween(dateInterval.startDate, dateInterval.endDate);
            });
    })
    .then(function (/**sntls.Collection*/authors) {
        var parsed = authors.mapValues(function (authorsOutput) {
            return AuthorsParser.parseTextOutput(authorsOutput);
        });

        // TODO: Re-arrange path structure. (date, author, name / email / commits)
        commitData.setNode(['authors'].toPath(), parsed.items);
    })
    .then(function () {
        return dateIntervals.dateIntervalCollection
            .mapValuesAsync(function (/**DateInterval*/dateInterval) {
                return gitRepo.getClocAt(dateInterval.endDate);
            });
    })
    .then(function (/**sntls.Collection*/cloc) {
        var parsed = cloc.mapValues(function (clocOutput) {
            return ClocParser.parseCsvOutput(clocOutput);
        });

        // TODO: Re-arrange path structure. (date, language, blank / comment / code)
        commitData.setNode(['cloc'].toPath(), parsed.items);

        console.log(JSON.stringify(commitData.items, null, 2));
    });
