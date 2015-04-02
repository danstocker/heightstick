Heightstick
===========

Command line codebase growth assessment tool for Git-based projects.

Outputs a JSON containing author and LOC (lines of code) information for each week, two weeks, or month since the first commit.

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

    heightstick --cloc-args="js"

gives the JSON below (as of 04/02/2015):

    {
      "2015-05-01T13:25:59.000Z": {
        "authors": {
          "dan.stocker@mangahigh.com": {
            "commits": 11,
            "name": "Dan Stocker ",
            "email": "dan.stocker@mangahigh.com"
          },
          "dan@kwaia.com": {
            "commits": 4,
            "name": "Dan Stocker ",
            "email": "dan@kwaia.com"
          }
        },
        "cloc": {
          "Javascript": {
            "files": "11",
            "language": "Javascript",
            "blank": "78",
            "comment": "231",
            "code": "386"
          }
        }
      }
    }

Credits
-------

Heightstick started as a "hack day" project at [Mangahigh](https://mangahigh.com).
