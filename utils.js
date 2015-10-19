'use strict';

/**
 * Expose the `lazy` object
 */

var utils = require('lazy-cache')(require);
var fn = require;

/**
 * Lazily required modules.
 *
 * These modules use lazy-caching, which means that they are only
 * required/loaded if the method using the module is called, so
 * data-store loads faster as a result.
 */

require = utils;
require('graceful-fs', 'fs');
require('kind-of', 'typeOf');
require('mkdirp', 'mkdirp');
require('resolve-dir', 'resolve');
require('has-own-deep', 'hasOwn');
require('union-value', 'union');
require('has-value', 'has');
require('rimraf', 'del');
require = fn;

utils.noop = function () {
  return;
};

utils.last = function (arr) {
  return arr[arr.length - 1];
};

utils.arrayify = function (val) {
  return Array.isArray(val) ? val : [val];
};

/**
 * Expose `utils`
 */

module.exports = utils;
