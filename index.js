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
 * @param  {String} `name` Store name to use for the basename of the `.json` file.
 * @param  {Object} `options`
 * @param {String} `options.cwd` Current working directory for storage. If not defined, the user home directory is used, based on OS. This is the only option currently, other may be added in the future.
 * @param {Number} `options.indent` Number passed to `JSON.stringify` when saving the data. Defaults to `2` if `null` or `undefined`
 * @api public
 */

class Store extends Emitter {
  constructor(name, options = {}, defaults = {}) {
    assert.equal(typeof name, 'string', 'expected options.name to be a string');
    super();
    this.name = name;
    this.options = options;
    this.indent = this.options.indent != null ? this.options.indent : 2;
    this.cwd = this.options.cwd || os.homedir();
    this.folder = this.options.folder || '.data-store';
    this.dirname = path.join(this.cwd, this.folder);
    this.path = this.options.path || path.join(this.dirname, this.name + '.json');
    this.relative = path.relative(process.cwd(), this.path);
    this.data = Object.assign({}, defaults, this.data);
  }

  /**
   * Get and set the `store.data` object that is persisted.
   */

  set data(val) {
    this._data = val;
    this.save();
  }
  get data() {
    return this._data || (this._data = this.load());
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
   * ```
   * @name .set
   * @param {String} `key`
   * @param {any} `val` The value to save to `key`. Must be a valid JSON type: String, Number, Array or Object.
   * @return {Object} `Store` for chaining
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
   * @param  {String} `key`
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
   * @param  {String} `key`
   * @return {any} The value to store for `key`.
   * @api public
   */

  get(key) {
    return key ? get(this.data, key) : this.data;
  }

  /**
   * Returns `true` if the specified `key` has a value.
   *
   * ```js
   * store.set('a', 'b');
   * store.set('c', null);
   * store.has('a'); //=> true
   * store.has('c'); //=> false
   * store.has('d'); //=> false
   * ```
   * @name .has
   * @param  {String} `key`
   * @return {Boolean} Returns true if `key` has
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

  hasOwn(key) {
    assert.equal(typeof key, 'string', 'expected key to be a string');
    return hasOwn(this.data, key);
  }

  /**
   * Delete `keys` from the store, or delete the entire store
   * if no keys are passed. A `del` event is also emitted for each key
   * deleted.
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

  del(key) {
    if (!key) key = this.keys;
    if (Array.isArray(key)) {
      for (const k of key) this.del(k);
      return this;
    }
    assert.equal(typeof key, 'string', 'expected key to be a string');
    delete this.data[key];
    this.emit('del', key);
    this.save();
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
   * @api public
   */

  save() {
    mkdirSync(path.dirname(this.path), this.options.mkdir);
    fs.writeFileSync(this.path, this.json(), { mode: 0o0600 });
    return this;
  }

  /**
   * Load the store.
   * @return {Object}
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

  get keys() {
    return Object.keys(this.data);
  }
}

/**
 * Create a directory and any intermediate directories that might exist.
 */

function mkdirSync(dirname, options = {}) {
  assert.equal(typeof dirname, 'string', 'expected a string');
  const opts = Object.assign({ cwd: process.cwd() }, options);
  const segs = path.relative(opts.cwd, dirname).split(path.sep);
  for (let i = 0; i <= segs.length; i++) {
    try {
      fs.mkdirSync(path.join(opts.cwd, ...segs.slice(0, i)), mode(opts));
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
  }
  return dirname;
}

function get(obj = {}, prop = '') {
  return obj[prop] || split(prop).reduce((acc, k) => acc && acc[strip(k)], obj);
}

function set(obj = {}, prop = '', val) {
  return split(prop).reduce((acc, k, i, arr) => {
    return (acc[k] = arr.length - 1 > i ? (acc[k] || {}) : val);
  }, obj);
}

function hasOwn(obj = {}, prop = '') {
  if (!prop) return false;
  if (obj.hasOwnProperty(prop)) return true;
  if (prop.indexOf('.') === -1) {
    return obj.hasOwnProperty(prop);
  }
  const segs = split(prop);
  const last = segs.pop();
  const val = get(obj, segs.join('.'));
  if (val && typeof val === 'object') {
    return val.hasOwnProperty(last);
  }
  return false;
}

/**
 * Expose `Store`
 */

module.exports = Store;
