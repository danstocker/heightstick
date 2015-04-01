Heightstick
===========

Command line codebase growth assessment tool for Git-based projects.

Installation
------------

    npm install -g heightstick

Usage
-----

Run heightstick directly from under the repo.

### Arguments

- `cloc-args`: Arguments to be passed to Cloc. See the [Cloc documentation](http://cloc.sourceforge.net/) for details. Defaults to `". --exclude-dir=node_modules"`, which will run CLOC on the entire repo excluding `node_modules`.
- `branch`: Branch that heightstick will operate on. Defaults to `"master"`.

Example
-------

    heightstick --cloc-args="src"

Credits
-------

Heightstick started as a "hack day" project at [Mangahigh](https://mangahigh.com).
