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
require('collection-visit', 'visit');
require('extend-shallow', 'extend');
require('get-value', 'get');
require('graceful-fs', 'fs');
require('has-own-deep', 'hasOwn');
require('has-value', 'has');
require('kind-of', 'typeOf');
require('mkdirp', 'mkdirp');
require('object.omit', 'omit');
require('rimraf', 'del');
require('set-value', 'set');
require('union-value', 'union');
require = fn;

/**
 * Expose `utils`
 */

module.exports = utils;
