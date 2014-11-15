'use strict';

var path = require('path');
var typeOf = require('kind-of');
var fs = require('graceful-fs');
var _ = require('lodash');

/**
 * Expose `Store`
 */

module.exports =  Store;

/**
 * Initialize a new `Store` with the given `name`
 * and `options`.
 *
 * ```js
 * var store = new Store('bar', 'foo');
 * //=> saves `{}` to 'foo/.bar.json'
 *
 * var store = new Store('baz');
 * //=> saves `{}` to '~/data-store/.baz.json'
 * ```
 *
 * @param  {String} `name` Dest file name. `foo` would result in `.foo.json`
 * @param  {String} `dest` Dest directory. If not defined, the user home directory
 *                         for the current OS is used.
 * @api public
 */

function Store(name, dest) {
  if (typeof name !== 'string') {
    throw new Error('data-store expects a string as the first argument.');
  }
  this.path = path.join((dest || home('data-store')), '.' + name + '.json');
  this.config = readFile(this.path) || {};
}

/**
 * Assign `value` to `key` and save to disk.
 *
 * ```js
 * store.set('foo', 'bar');
 * // or
 * store.set({foo: 'bar'});
 * ```
 * @param {String} `key`
 * @param {*} `val` The value to save to `key`. Must be a valid JSON type: String, Number, Array or Object.
 * @return {Object} `Store` for chaining
 * @api public
 */

Store.prototype.set = function(key, val) {
  if (typeof val === 'function') {
    throw new Error('Store#set cannot set functions as values:' + String(val));
  }

  if (typeOf(key) === 'object') {
    _.extend(this.config, key);
  } else {
    this.config[key] = val;
  }

  this.save();
  return this;
};

/**
 * Get the stored `value` of `key`, or return all stored values
 * if no `key` is defined.
 *
 * ```js
 * store.set('foo', 'bar');
 * store.get('foo');
 * //=> 'bar'
 * ```
 *
 * @param  {String} `key`
 * @return {*} The stored value of `key`.
 * @api public
 */

Store.prototype.get = function(key) {
  if (!key) {
    return _.cloneDeep(this.config);
  }
  return this.config[key];
};

/**
 * Save the store to disk.
 *
 * ```js
 * store.save();
 * ```
 * @param {String} `dest` Optionally define an alternate destination.
 * @api public
 */

Store.prototype.save = function(dest) {
  writeJson(dest || this.path, this.config);
};

/**
 * Delete a property or array of properties from the store then
 * re-save the store.
 *
 * ```js
 * store.omit('foo');
 * // or
 * store.omit(['foo', 'bar']);
 * ```
 *
 * @param {String|Array} `key` The key(s) to omit from the store
 * @api public
 */

Store.prototype.omit = function(keys) {
  keys = [].concat.apply([], arguments);

  for (var i = 0; i < keys.length; i++) {
    delete this.config[keys[i]];
  }

  this.save();
  return this;
};

/**
 * Get the user's home directory
 *
 * @api private
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
 * @api private
 */

function readFile(fp) {
  try {
    return require(path.resolve(fp));
  } catch(err) {}
  return {};
}

/**
 * Synchronously write files to disk, also creating any
 * intermediary directories if they don't exist.
 *
 * @param {String} `dest`
 * @param {String} `str`
 * @api private
 */

function writeJson(dest, str, opts) {
  var dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    mkdir(dir);
  }

  try {
    var json = JSON.stringify(str, null, 2);
    fs.writeFileSync(dest, json);
  } catch (err) {
    console.log(err);
  }
}

/**
 * Make the given directory and intermediates
 * if they don't already exist.
 *
 * @param {String} `dirpath`
 * @param {Number} `mode`
 * @return {String}
 * @api private
 */

function mkdir(dir, mode) {
  mode = mode || parseInt('0777', 8) & (~process.umask());
  if (!fs.existsSync(dir)) {
    var parent = path.dirname(dir);

    if (fs.existsSync(parent)) {
      fs.mkdirSync(dir, mode);
    } else {
      mkdir(parent);
      fs.mkdirSync(dir, mode);
    }
  }
}
