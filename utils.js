'use strict';

/**
 * Expose the `lazy` object
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils; // eslint-disable-line
require('clone-deep', 'clone');
require('define-property', 'define');
require('graceful-fs', 'fs');
require('has-own-deep', 'hasOwn');
require('mkdirp', 'mkdirp');
require('project-name', 'project');
require('resolve-dir', 'resolve');
require('rimraf', 'del');
require('union-value', 'union');
require = fn; // eslint-disable-line

utils.noop = function() {
  return;
};

utils.last = function(arr) {
  return arr[arr.length - 1];
};

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Throw an error if sub-store `name` has non-word characters, or
 * `name` is the same as a key on `store`.
 *
 * @param {Object} `store`
 * @param {String} `name`
 */

utils.validateName = function(store, name) {
  if (~store.keys.indexOf(name) || /\W/.test(name)) {
    throw utils.formatConflictError(name);
  }
};

/**
 * Format the error used when sub-store `name` is
 * invalid.
 *
 * @param {String} `name`
 */

utils.formatConflictError = function(name) {
  var msg = 'Cannot create store: '
    + '"' + name + '", since '
    + '"' + name + '" is a reserved property key. '
    + 'Please choose a different store name.';
  return new Error(msg);
};

/**
 * Expose `utils`
 */

module.exports = utils;
