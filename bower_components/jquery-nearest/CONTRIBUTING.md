# Contribution Guide

First of all, thanks for wanting to take the time to make this code better. Every little bit helps.

## Basic process

1. Fork this repository
2. Create a new branch for your feature / bug fix - this helps to avoid merge conflicts on the `master` branch
3. Write code and tests
4. Create a pull request

## Which files to edit

For the plugin itself: **`src/jquery.nearest.js`** (plus tests, see below)

For documentation: **`index.html`**

Don't worry about updating the minified JS file, it gets built automatically as part of a release.

## Tests

Tests are run using QUnit and live in **`test/nearest_test.js`**. Open `test/index.html` in a browser to make sure tests are passing.

If you're changing the plugin code, at least one test must be present in the pull request:

* If you add a new feature, write new tests for it.
* If you fix a bug, write a test that shows it was a bug (and makes sure there aren't regressions later).

