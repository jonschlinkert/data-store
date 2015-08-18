'use strict';

/**
 * Module dependencies
 */

var path = require('path');
var util = require('util');
var typeOf = require('kind-of');
var omit = require('object.omit');
var extend = require('extend-shallow');
var Emitter = require('component-emitter');
var visit = require('collection-visit');

/**
 * Lazily required modules.
 *
 * These modules use lazy-caching, which means that they are only
 * required/loaded if the method using the module is called. As a
 * result, data-store loads much faster.
 */

var lazy = require('lazy-cache')(require);
var lazyFs = lazy('graceful-fs');
var lazyDel = lazy('rimraf');
var lazyMkdir = lazy('mkdirp');
var lazyGet = lazy('get-value');
var lazySet = lazy('set-value');
var lazyHas = lazy('has-value');
var lazyUnion = lazy('union-value');
var lazyHasOwn = lazy('has-own-deep');

/**
 * Expose `Store`
 */

module.exports =  Store;

/**
 * Initialize a new `Store` with the given `name`
 * and `options`.
 *
 * ```js
 * var store = new Store('abc');
 * //=> '~/data-store/a.json'
 *
 * var store = new Store('abc', {cwd: 'test/fixtures'});
 * //=> './test/fixtures/abc.json'
 * ```
 *
 * @param  {String} `name` Store name.
 * @param  {Object} `options`
 *   @option {String} [options] `cwd` Current working directory for storage. If not defined, the user home directory is used, based on OS. This is the only option currently, other may be added in the future.
 * @api public
 */

function Store(name, options) {
  if (typeof name !== 'string') {
    throw new Error('data-store expects a string as the first argument.');
  }

  Emitter.call(this);
  options = options || {};
  var cwd = options.cwd || home('data-store');

  this.indent = options.indent;
  this.name = name;
  this.path = path.join(cwd, name + '.json');
  this.data = readFile(this.path) || {};
}

util.inherits(Store, Emitter);

/**
 * Assign `value` to `key` and save to disk. Can be
 * a key-value pair or an object.
 *
 * ```js
 * // key, value
 * store.set('a', 'b');
 * //=> {a: 'b'}
 *
 * // extend the store with an object
 * store.set({a: 'b'});
 * //=> {a: 'b'}
 *
 * // extend the the given value
 * store.set('a', {b: 'c'});
 * store.set('a', {d: 'e'}, true);
 * //=> {a: {b 'c', d: 'e'}}
 *
 * // overwrite the the given value
 * store.set('a', {b: 'c'});
 * store.set('a', {d: 'e'});
 * //=> {d: 'e'}
 * ```
 * @param {String} `key`
 * @param {any} `val` The value to save to `key`. Must be a valid JSON type: String, Number, Array or Object.
 * @return {Object} `Store` for chaining
 * @api public
 */

Store.prototype.set = function(key, val) {
  if (typeof val === 'function') {
    throw new Error('Store#set cannot set functions as values: ' + val.toString());
  }

  if (typeof key === 'object') {
    return this.visit('set', key);

  } else if (typeOf(val) === 'object') {
    var existing = this.get(key);
    val = extend({}, existing, val);
  }

  lazySet()(this.data, key, val);
  this.emit('set', key, val);

  this.save();
  return this;
};

/**
 * Add or append an array of unique values to the given `key`.
 *
 * ```js
 * store.union('a', ['a']);
 * store.union('a', ['b']);
 * store.union('a', ['c']);
 * store.get('a');
 * //=> ['a', 'b', 'c']
 * ```
 *
 * @param  {String} `key`
 * @return {any} The array to add or append for `key`.
 * @api public
 */

Store.prototype.union = function (key, val) {
  lazyUnion()(this.data, key, val);
  this.emit('union', key, val);
  return this;
};

/**
 * Get the stored `value` of `key`, or return the entire store
 * if no `key` is defined.
 *
 * ```js
 * store.set('a', {b: 'c'});
 * store.get('a');
 * //=> {b: 'c'}
 *
 * store.get();
 * //=> {b: 'c'}
 * ```
 *
 * @param  {String} `key`
 * @return {any} The value to store for `key`.
 * @api public
 */

Store.prototype.get = function (key) {
  return key ? lazyGet()(this.data, key) : {
    name: this.name,
    data: this.data
  };
};

/**
 * Returns `true` if the specified `key` has truthy value.
 *
 * ```js
 * store.set('a', 'b');
 * store.set('c', null);
 * store.has('a'); //=> true
 * store.has('c'); //=> false
 * store.has('d'); //=> false
 * ```
 *
 * @param  {String} `key`
 * @return {Boolean} Returns true if `key` has
 * @api public
 */

Store.prototype.has = function(key) {
  return lazyHas()(this.data, key);
};

/**
 * Returns `true` if the specified `key` exists.
 *
 * ```js
 * store.set('a', 'b');
 * store.set('b', false);
 * store.set('c', null);
 * store.set('d', true);
 *
 * store.hasOwn('a'); //=> true
 * store.hasOwn('b'); //=> true
 * store.hasOwn('c'); //=> true
 * store.hasOwn('d'); //=> true
 * store.hasOwn('foo'); //=> false
 * ```
 *
 * @param  {String} `key`
 * @return {Boolean} Returns true if `key` exists
 * @api public
 */

Store.prototype.hasOwn = function(key) {
  if (key.indexOf('.') === -1) {
    return this.data.hasOwnProperty(key);
  }
  return lazyHasOwn()(this.data, key);
};

/**
 * Persist the store to disk.
 *
 * ```js
 * store.save();
 * ```
 * @param {String} `dest` Optionally define an alternate destination file path.
 * @api public
 */

Store.prototype.save = function(dest) {
  writeJson(dest || this.path, this.data, this.indent);
};

/**
 * Delete `keys` from the store, or delete the entire store
 * if no keys are passed.
 *
 * **Note that to delete the entire store you must pass `{force: true}`**
 *
 * ```js
 * store.del();
 *
 * // to delete paths outside cwd
 * store.del({force: true});
 * ```
 *
 * @param {String|Array|Object} `keys` Keys to remove, or options.
 * @param {Object} `options`
 * @api public
 */

Store.prototype.del = function(keys, options) {
  if (typeof keys !== 'string' && !Array.isArray(keys)) {
    options = keys;
    keys = [];
  }

  // if keys are passed, only omit those properties
  keys = Array.isArray(keys) ? keys : [keys];
  if (keys.length) {
    this.data = omit(this.data, keys);
    return this;
  }

  options = options || {};
  var del = lazyDel();

  // if no keys are passed, delete the entire store
  del(this.path, options, function (err) {
    if (err) return console.error(err);
    this.data = {};
    this.emit('del', keys);
  }.bind(this));
};

/**
 * Call the given `method` on each property in the given
 * object.
 *
 * @param  {String} `method`
 * @param  {Object} `object`
 */

Store.prototype.visit = function(method, object) {
  visit(this, method, object);
  return this;
};

/**
 * Get the user's home directory
 *
 * @param {String} `fp`
 * @return {String}
 */

function home(fp) {
  var res = (process.platform === 'win32')
    ? process.env.USERPROFILE
    : process.env.HOME;
  return path.join(res, fp);
}

/**
 * Read JSON files.
 *
 * @param {String} `fp`
 * @return {Object}
 */

function readFile(fp) {
  try {
    var fs = lazyFs();
    var str = fs.readFileSync(path.resolve(fp), 'utf8');
    return JSON.parse(str);
  } catch(err) {}
  return {};
}

/**
 * Synchronously write files to disk, also creating any
 * intermediary directories if they don't exist.
 *
 * @param {String} `dest`
 * @param {String} `str`
 * @param {Number} `indent` Indent passed to JSON.stringify (default 2)
 */

function writeJson(dest, str, indent) {
  if (typeof indent === 'undefined' || indent === null) {
    indent = 2;
  }
  var dir = path.dirname(dest);
  var fs = lazyFs();
  try {
    var mkdir = lazyMkdir();
    if (!fs.existsSync(dir)) {
      mkdir.sync(dir);
    }
    fs.writeFileSync(dest, JSON.stringify(str, null, indent));
  } catch (err) {
    err.origin = __filename;
    throw new Error('data-store: ' + err);
  }
}
