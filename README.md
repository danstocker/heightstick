Heightstick
===========

Command line codebase growth assessment tool for Git-based projects.

Outputs JSON or CSV containing repo information for each week, two weeks, or month between the first and last commits.

Installation
------------

1. Make sure you have git installed.
2. Install [CLOC](http://cloc.sourceforge.net/).
3. Install heightstick: `npm install -g heightstick`

Usage
-----

Run heightstick directly from under the repo.

### Arguments

- `help`: Displays help screen.
- `--cloc-args`: Arguments to be passed to Cloc. See the [Cloc documentation](http://cloc.sourceforge.net/) for details. Defaults to `". --exclude-dir=node_modules"`, which will run CLOC on the entire repo excluding `node_modules`.
- `--branch`: Branch that heightstick will operate on. Defaults to `"master"`.
- `--format`: Output format. Either `"json"`, `"csv"`, or `"raw-json"`.
- `--sampling`: Sampling resolution. Accepts `"weekly"`, `"biweekly"` and `"monthly"`. Defaults to `"monthly"`.

Example
-------

The following command, when ran under heightstick's repo,

    heightstick --cloc-args="js" --format=csv

gives the CSV below (as of 04/03/2015):

    date,committerCount,totalCommitCount,medianCommitCount,normalizedTeamSize,netCodeSize,grossCodeSize,documentationRatio
    "2015-05-01","2","29","17","1.7058823529411764","555","966","0.3167701863354037"

Credits
-------

Heightstick started as a "hack day" project at [Mangahigh](https://mangahigh.com).
