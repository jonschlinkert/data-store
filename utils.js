'use strict';

/**
 * Expose the `lazy` object
 */

var lazy = module.exports = require('lazy-cache')(require);

/**
 * Lazily required modules.
 *
 * These modules use lazy-caching, which means that they are only
 * required/loaded if the method using the module is called. As a
 * result, data-store loads much faster.
 */

lazy('collection-visit', 'visit');
lazy('extend-shallow', 'extend');
lazy('get-value', 'get');
lazy('graceful-fs', 'fs');
lazy('has-own-deep', 'hasOwn');
lazy('has-value', 'has');
lazy('kind-of', 'typeOf');
lazy('mkdirp', 'mkdirp');
lazy('object.omit', 'omit');
lazy('rimraf', 'del');
lazy('set-value', 'set');
lazy('union-value', 'union');
