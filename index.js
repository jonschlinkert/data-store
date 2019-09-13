'use strict';

const kData = Symbol('data-store');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const utils = require('./utils');

/**
 * Module dependencies
 */

const get = require('get-value');
const set = require('set-value');

/**
 * Initialize a new `Store` with the given `name`, `options` and `default` data.
 *
 * ```js
 * const store = require('data-store')('abc');
 * //=> '~/data-store/a.json'
 *
 * const store = require('data-store')('abc', { cwd: 'test/fixtures' });
 * //=> './test/fixtures/abc.json'
 * ```
 * @name Store
 * @param {String} `name` Store name to use for the basename of the `.json` file.
 * @param {object} `options` See all [available options](#options).
 * @param {object} `defaults` An object to initialize the store with.
 * @api public
 */

class Store {
  constructor(name, options = {}, defaults = {}) {
    if (typeof name !== 'string') {
      defaults = options;
      options = name || {};
      name = options.name;
    }

    if (!options.path) {
      assert.equal(typeof name, 'string', 'expected store name to be a string');
    }

    const opts = { debounce: 0, indent: 2, home: os.homedir(), name, ...options };

    this.name = opts.name || (opts.path ? utils.stem(opts.path) : 'data-store')
    this.path = opts.path || path.join(opts.home, `${this.name}.json`);
    this.indent = opts.indent;
    this.debounce = opts.debounce;
    this.defaults = defaults || opts.default;
    this.timeouts = {};
  }

  /**
   * Assign `value` to `key` and save to the file system. Can be a key-value pair,
   * array of objects, or an object.
   *
   * ```js
   * // key, value
   * store.set('a', 'b');
   * //=> {a: 'b'}
   *
   * // extend the store with an object
   * store.set({a: 'b'});
   * //=> {a: 'b'}
   * ```
   * @name .set
   * @param {String} `key`
   * @param {any} `val` The value to save to `key`. Must be a valid JSON type: String, Number, Array or Object.
   * @return {Object} `Store` for chaining
   * @api public
   */

  set(key, val) {
    if (typeof key === 'string' && typeof val === 'undefined') {
      return this.del(key);
    }

    if (utils.isObject(key)) {
      for (const k of Object.keys(key)) {
        this.set(k.split(/\\?\./).join('\\.'), key[k]);
      }
    } else {
      assert.equal(typeof key, 'string', 'expected key to be a string');
      set(this.data, key, val);
    }

    this.save();
    return this;
  }

  /**
   * Add the given `value` to the array at `key`. Creates a new array if one
   * doesn't exist, and only adds unique values to the array.
   *
   * ```js
   * store.union('a', 'b');
   * store.union('a', 'c');
   * store.union('a', 'd');
   * store.union('a', 'c');
   * console.log(store.get('a'));
   * //=> ['b', 'c', 'd']
   * ```
   * @name .union
   * @param  {String} `key`
   * @param  {any} `val` The value to union to `key`. Must be a valid JSON type: String, Number, Array or Object.
   * @return {Object} `Store` for chaining
   * @api public
   */

  union(key, ...rest) {
    assert.equal(typeof key, 'string', 'expected key to be a string');
    const vals = this.get(key);
    const values = [].concat(utils.isEmptyPrimitive(vals) ? [] : vals);
    this.set(key, utils.unique(utils.flatten(...values, ...rest)));
    return this;
  }

  /**
   * Get the stored `value` of `key`.
   *
   * ```js
   * store.set('a', {b: 'c'});
   * store.get('a');
   * //=> {b: 'c'}
   *
   * store.get();
   * //=> {a: {b: 'c'}}
   * ```
   * @name .get
   * @param {String} `key`
   * @return {any} The value to store for `key`.
   * @api public
   */

  get(key, fallback) {
	if (typeof key === 'undefined') return this.data;
    assert.equal(typeof key, 'string', 'expected key to be a string');
    const value = get(this.data, key);
    if (typeof value === 'undefined') {
      return fallback;
    }
    return value;
  }

  /**
   * Returns `true` if the specified `key` has a value.
   *
   * ```js
   * store.set('a', 42);
   * store.set('c', null);
   *
   * store.has('a'); //=> true
   * store.has('c'); //=> true
   * store.has('d'); //=> false
   * ```
   * @name .has
   * @param {String} `key`
   * @return {Boolean} Returns true if `key` has
   * @api public
   */

  has(key) {
    return typeof this.get(key) !== 'undefined';
  }

  /**
   * Returns `true` if the specified `key` exists.
   *
   * ```js
   * store.set('a', 'b');
   * store.set('b', false);
   * store.set('c', null);
   * store.set('d', true);
   * store.set('e', undefined);
   *
   * store.hasOwn('a'); //=> true
   * store.hasOwn('b'); //=> true
   * store.hasOwn('c'); //=> true
   * store.hasOwn('d'); //=> true
   * store.hasOwn('e'); //=> true
   * store.hasOwn('foo'); //=> false
   * ```
   * @name .hasOwn
   * @param {String} `key`
   * @return {Boolean} Returns true if `key` exists
   * @api public
   */

  hasOwn(key) {
    assert.equal(typeof key, 'string', 'expected key to be a string');
    return utils.hasOwn(this.data, key);
  }

  /**
   * Delete one or more properties from the store.
   *
   * ```js
   * store.set('foo.bar', 'baz');
   * console.log(store.data); //=> { foo: { bar: 'baz' } }
   * store.del('foo.bar');
   * console.log(store.data); //=> { foo: {} }
   * store.del('foo');
   * console.log(store.data); //=> {}
   * ```
   * @name .del
   * @param {String|Array} `keys` One or more properties to delete.
   * @api public
   */

  del(key) {
    if (Array.isArray(key)) {
      for (const k of key) this.del(k);
      return this;
    }

    assert.equal(typeof key, 'string', 'expected key to be a string, use .clear() to delete all properties');
    if (utils.del(this.data, key)) {
      this.save();
    }
    return this;
  }

  /**
   * Return a clone of the `store.data` object.
   *
   * ```js
   * console.log(store.clone());
   * ```
   * @name .clone
   * @return {Object}
   * @api public
   */

  clone() {
    return utils.cloneDeep(this.data);
  }

  /**
   * Clear `store.data` to an empty object.
   *
   * ```js
   * store.clear();
   * ```
   * @name .clear
   * @return {undefined}
   * @api public
   */

  clear() {
    this.data = {};
    this.save();
  }

  /**
   * Stringify the store. Takes the same arguments as `JSON.stringify`.
   *
   * ```js
   * console.log(store.json(null, 2));
   * ```
   * @name .json
   * @param {Function} `replacer` Replacer function.
   * @param {String} `indent` Indentation to use. Default is 2 spaces.
   * @return {String}
   * @api public
   */

  json(replacer = null, indent = this.indent) {
    return JSON.stringify(this.data, replacer, indent);
  }

  /**
   * Immediately write the store to the file system. This method should probably
   * not be called directly. Unless you are familiar with the inner workings of
   * the code it's recommended that you use .save() instead.
   *
   * ```js
   * store.writeFile();
   * ```
   * @name .writeFile
   * @return {undefined}
   */

  writeFile() {
    utils.mkdir(path.dirname(this.path));
    fs.writeFileSync(this.path, this.json(), { mode: 0o0600 });
  }

  /**
   * Calls [.writeFile()](#writefile) to persist the store to the file system,
   * after an optional [debounce](#options) period. This method should probably
   * not be called directly as it's used internally by other methods.
   *
   * ```js
   * store.save();
   * ```
   * @name .save
   * @return {undefined}
   * @api public
   */

  save() {
    if (!this.debounce) return this.writeFile();
    if (this.timeouts.save) clearTimeout(this.timeouts.save);
    this.timeouts.save = setTimeout(this.writeFile.bind(this), this.debounce);
  }

  /**
   * Delete the store from the file system.
   *
   * ```js
   * store.unlink();
   * ```
   * @name .unlink
   * @return {undefined}
   * @api public
   */

  unlink() {
    clearTimeout(this.timeouts.save);
    utils.tryUnlink(this.path);
  }

  /**
   * Load the store.
   * @return {Object}
   */

  load() {
    try {
      return (this[kData] = JSON.parse(fs.readFileSync(this.path)));
    } catch (err) {
      if (err.code === 'EACCES') {
        err.message += '\ndata-store does not have permission to load this file\n';
        throw err;
      }
      // (re-)initialize if file doesn't exist or is corrupted
      if (err.code === 'ENOENT' || err.name === 'SyntaxError') {
        this[kData] = {};
        return {};
      }
    }
  }

  /**
   * Getter/setter for the `store.data` object, which holds the values
   * that are persisted to the file system.
   *
   * ```js
   * console.log(store.data); //=> {}
   * store.data.foo = 'bar';
   * console.log(store.get('foo')); //=> 'bar'
   * ```
   * @name .data
   * @return {Object}
   */

  set data(data) {
    this[kData] = data;
    this.save();
  }
  get data() {
    let data = this[kData] || this.load();
    if (!this.saved) {
      data = { ...this.defaults, ...data };
    }
    this[kData] = data;
    return data;
  }
}

/**
 * Expose `Store`
 */

module.exports = function(...args) {
  return new Store(...args);
};

module.exports.Store = Store;
