'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const Emitter = require('events');
const flatten = (...args) => [].concat.apply([], args);
const unique = arr => arr.filter((v, i) => arr.indexOf(v) === i);
const mode = opts => opts.mode || (parseInt('0777', 8) & ~process.umask());
const strip = str => str.replace(/\\(?=\.)/g, '');
const split = str => str.split(/(?<!\\)\./).map(strip);

/**
 * Initialize a new `Store` with the given `name`
 * and `options`.
 *
 * ```js
 * const store = require('data-store')('abc');
 * //=> '~/data-store/a.json'
 *
 * const store = require('data-store')('abc', {
 *   cwd: 'test/fixtures'
 * });
 * //=> './test/fixtures/abc.json'
 * ```
 *
 * @param {string} `name` Store name to use for the basename of the `.json` file.
 * @param {object} `options`
 * @param {string} `options.cwd` Current working directory for storage. If not defined, the user home directory is used, based on OS. This is the only option currently, other may be added in the future.
 * @param {number} `options.indent` Number passed to `JSON.stringify` when saving the data. Defaults to `2` if `null` or `undefined`
 * @api public
 */

class Store extends Emitter {
  constructor(name, options = {}, defaults = {}) {
    if (typeof name !== 'string') {
      defaults = options;
      options = name || {};
      name = options.name;
    }

    assert.equal(typeof name, 'string', 'expected name to be a string');
    super();
    this.name = name;
    this.options = options;
    this.indent = this.options.indent != null ? this.options.indent : 2;
    this.folder = this.options.folder || '.config/.data-store';
    this.cwd = this.options.cwd || os.homedir();
    this.base = path.join(this.cwd, this.folder);
    this.path = this.options.path || path.join(this.base, this.name + '.json');
    this.data = Object.assign({}, defaults, this.data);
  }

  /**
   * Assign `value` to `key` and save to disk. Can be a key-value pair,
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
   * @param {string} `key`
   * @param {any} `val` The value to save to `key`. Must be a valid JSON type: String, Number, Array or Object.
   * @return {object} `Store` for chaining
   * @api public
   */

  set(key, val) {
    if (typeof key !== 'string') {
      for (const k of Array.isArray(key) ? key : Object.keys(key)) {
        this.set(k, key[k]);
      }
      return this;
    }
    assert.equal(typeof key, 'string', 'expected key to be a string');
    set(this.data, key, val);
    this.emit('set', key, val);
    this.save();
    return this;
  }

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
   * @name .union
   * @param {string} `key`
   * @return {any} The value to store for `key`.
   * @api public
   */

  union(key, ...rest) {
    assert.equal(typeof key, 'string', 'expected key to be a string');
    let arr = this.get(key);
    if (arr == null) arr = [];
    if (!Array.isArray(arr)) arr = [arr];
    this.set(key, unique(flatten(...arr, ...rest)));
    return this;
  }

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
   * @name .get
   * @param {string} `key`
   * @return {any} The value to store for `key`.
   * @api public
   */

  get(key) {
    return key ? get(this.data, key) : Object.assign({}, this.data);
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
   * @param {string} `key`
   * @return {boolean} Returns true if `key` has
   * @api public
   */

  has(key) {
    assert.equal(typeof key, 'string', 'expected key to be a string');
    return typeof get(this.data, key) !== 'undefined';
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
   *
   * @param {string} `key`
   * @return {boolean} Returns true if `key` exists
   * @api public
   */

  hasOwn(key) {
    assert.equal(typeof key, 'string', 'expected key to be a string');
    return hasOwn(this.data, key);
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
   * @param {string|Array} `keys` One or more properties to delete.
   * @api public
   */

  del(key) {
    if (!key) key = this.keys;
    if (Array.isArray(key)) {
      for (const k of key) this.del(k);
      return this;
    }
    assert.equal(typeof key, 'string', 'expected key to be a string');
    if (del(this.data, key)) {
      this.emit('del', key);
      this.save();
    }
    return this;
  }

  /**
   * Stringify the store
   */

  json(replacer = null, space = this.indent) {
    return JSON.stringify(this.data, replacer, space);
  }

  /**
   * Persist the store to the file system.
   *
   * ```js
   * store.save();
   * ```
   */

  save() {
    mkdirSync(path.dirname(this.path), this.options.mkdir);
    fs.writeFileSync(this.path, this.json(), { mode: 0o0600 });
    return this;
  }

  /**
   * Load the store.
   * @return {object}
   */

  load() {
    try {
      return JSON.parse(fs.readFileSync(this.path));
    } catch (err) {
      if (err.code === 'EACCES') {
        err.message += '\ndata-store does not have permission to load this file\n';
        throw err;
      }
      if (err.code === 'ENOENT' || err.name === 'SyntaxError') {
        this.data = {};
        return {};
      }
    }
  }

  /**
   * Get and set the `store.data` object that is used for storing values.
   * This object is persisted to the file system.
   */

  set data(val) {
    this._data = val;
    this.save();
  }
  get data() {
    return this._data || (this._data = this.load());
  }

  /**
   * Convenience getter for `Object.keys(store.data)`.
   * @return {array}
   * @api public
   */

  get keys() {
    return Object.keys(this.data);
  }
}

/**
 * Create a directory and any intermediate directories that might exist.
 */

function mkdirSync(dirname, options = {}) {
  assert.equal(typeof dirname, 'string', 'expected dirname to be a string');
  const opts = Object.assign({ cwd: process.cwd(), fs }, options);
  const segs = path.relative(opts.cwd, dirname).split(path.sep);
  const make = dir => fs.mkdirSync(dir, mode(opts));
  for (let i = 0; i <= segs.length; i++) {
    try {
      make((dirname = path.join(opts.cwd, ...segs.slice(0, i))));
    } catch (err) {
      handleError(dirname, opts)(err);
    }
  }
  return dirname;
}

function handleError(dir, opts = {}) {
  return (err) => {
    if (err.code !== 'EEXIST' || path.dirname(dir) === dir || !opts.fs.statSync(dir).isDirectory()) {
      throw err;
    }
  };
}

function get(obj = {}, prop = '') {
  return obj[prop] == null
    ? split(prop).reduce((acc, k) => acc && acc[strip(k)], obj)
    : obj[prop];
}

function set(obj = {}, prop = '', val) {
  return split(prop).reduce((acc, k, i, arr) => {
    return (acc[k] = arr.length - 1 > i ? (acc[k] || {}) : val);
  }, obj);
}

function del(obj = {}, prop = '') {
  if (!prop) return false;
  if (obj.hasOwnProperty(prop)) {
    delete obj[prop];
    return true;
  }
  const segs = split(prop);
  const last = segs.pop();
  const val = segs.length ? get(obj, segs.join('.')) : obj;
  if (isObject(val) && val.hasOwnProperty(last)) {
    delete val[last];
    return true;
  }
}

function hasOwn(obj = {}, prop = '') {
  if (!prop) return false;
  if (obj.hasOwnProperty(prop)) return true;
  if (prop.indexOf('.') === -1) return false;
  const segs = split(prop);
  const last = segs.pop();
  const val = segs.length ? get(obj, segs.join('.')) : obj;
  return isObject(val) && val.hasOwnProperty(last);
}

function isObject(val) {
  return val && typeof val === 'object';
}

/**
 * Expose `Store`
 */

module.exports = Store;
