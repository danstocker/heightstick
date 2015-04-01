#!/usr/bin/env node
/*jshint node:true */
'use strict';

require('./Collection.js');

var sntls = require('sntls'),
    Q = require('q'),
    DateIntervals = require('./DateIntervals.js'),
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
        // TODO: Re-arrange path structure.
        commitData.setNode(['authors'].toPath(), authors.items);
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

        // TODO: Re-arrange path structure.
        commitData.setNode(['cloc'].toPath(), parsed.items);

        console.log(JSON.stringify(commitData.items, null, 2));
    });
