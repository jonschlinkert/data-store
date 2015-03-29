'use strict';

var fs = require('graceful-fs');
var path = require('path');
var typeOf = require('kind-of');
var merge = require('mixin-deep');
var mkdir = require('mkdirp');
var get = require('get-value');
var set = require('set-value');
var has = require('has-value');
var del = require('rimraf');

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

  options = options || {};
  var cwd = options.cwd || home('data-store');

  this.name = name;
  this.path = path.join(cwd, name + '.json');
  this.data = readFile(this.path) || {};
}

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
 * @param {*} `val` The value to save to `key`. Must be a valid JSON type: String, Number, Array or Object.
 * @return {Object} `Store` for chaining
 * @api public
 */

Store.prototype.set = function(key, val) {
  if (typeof val === 'function') {
    throw new Error('Store#set cannot set functions as values: ' + val.toString());
  }

  if (typeOf(key) === 'object') {
    merge(this.data, key);
  } else if (typeOf(val) === 'object') {
    set(this.data, key, merge(this.get(key) || {}, val));
  } else {
    set(this.data, key, val);
  }

  this.save();
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
 * @return {*} The value to store for `key`.
 * @api public
 */

Store.prototype.get = function (key) {
  return key ? get(this.data, key) : {
    name: this.name,
    data: this.data
  };
};

/**
 * Returns `true` if the specified `key` has.
 *
 * ```js
 * store.set('a', 'b');
 * store.has('a');
 * //=> true
 * ```
 *
 * @param  {String} `key`
 * @return {Boolean} Returns true if `key` has
 * @api public
 */

Store.prototype.has = function(key) {
  if (key.indexOf('.') === -1) {
    return this.data.hasOwnProperty(key);
  }
  return has(this.data, key);
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
  writeJson(dest || this.path, this.data);
};

/**
 * Delete a property or array of properties from the store then
 * re-save the store.
 *
 * ```js
 * // string
 * store.omit('a');
 *
 * // array
 * store.omit(['a', 'b']);
 * ```
 *
 * @param {String|Array} `key` The key(s) to omit from the store
 * @return {Object} `Store` for chaining
 * @api public
 */

Store.prototype.omit = function(keys) {
  keys = [].concat.apply([], arguments);
  for (var i = 0; i < keys.length; i++) {
    delete this.data[keys[i]];
  }
  this.save();
  return this;
};

/**
 * Delete the entire store.
 *
 * **Note that you must pass `{force: true}` to delete
 * paths outside the current working directory.**
 *
 * ```js
 * store.delete();
 *
 * // to delete paths outside cwd
 * store.delete({force: true});
 * ```
 *
 * @api public
 */

Store.prototype.delete = function(options) {
  del(this.path, options, function (err) {
    if (err) return console.log(err);
    this.data = {};
  }.bind(this));
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
 */

function writeJson(dest, str) {
  var dir = path.dirname(dest);
  try {
    if (!fs.existsSync(dir)) {
      mkdir.sync(dir);
    }
    fs.writeFileSync(dest, JSON.stringify(str, null, 2));
  } catch (err) {
    err.origin = __filename;
    throw new Error('data-store: ' + err);
  }
}
