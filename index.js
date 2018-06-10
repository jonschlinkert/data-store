'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const flatten = (...args) => [].concat.apply([], args);
const unique = arr => arr.filter((v, i) => arr.indexOf(v) === i);

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
 * @param {string} `name` Store name to use for the basename of the `.json` file.
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

    assert.equal(typeof name, 'string', 'expected store name to be a string');
    const { debounce = 5, indent = 2, home, base } = options;
    this.name = name;
    this.options = options;
    this.defaults = defaults || options.default;
    this.indent = indent;
    this.debounce = debounce;
    this.home = home || process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
    this.base = base || path.join(this.home, 'data-store');
    this.path = this.options.path || path.join(this.base, this.name + '.json');
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
   * @param {string} `key`
   * @param {any} `val` The value to save to `key`. Must be a valid JSON type: String, Number, Array or Object.
   * @return {object} `Store` for chaining
   * @api public
   */

  set(key, val) {
    if (isObject(key)) {
      Object.assign(this.data, key);
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
   * @param  {string} `key`
   * @param  {any} `val` The value to union to `key`. Must be a valid JSON type: String, Number, Array or Object.
   * @return {object} `Store` for chaining
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
   * @param {string} `key`
   * @return {any} The value to store for `key`.
   * @api public
   */

  get(key) {
    assert.equal(typeof key, 'string', 'expected key to be a string');
    return get(this.data, key);
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
   * @name .hasOwn
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
   * @name .del
   * @param {string|Array} `keys` One or more properties to delete.
   * @api public
   */

  del(key) {
    if (Array.isArray(key)) {
      for (const k of key) this.del(k);
      return this;
    }
    assert.equal(typeof key, 'string', 'expected key to be a string');
    if (del(this.data, key)) {
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
   * @return {object}
   * @api public
   */

  clone() {
    return cloneDeep(this.data);
  }

  /**
   * Reset `store.data` to an empty object.
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
   * @return {string}
   * @api public
   */

  json(replacer = null, space = this.indent) {
    return JSON.stringify(this.data, replacer, space);
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
    if (this.save.debounce) return;
    this.save.debounce = setTimeout(() => this.writeFile(), this.debounce);
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
    let wait = 0;

    if (this.unlink.clear) this.unlink.clear();

    const debounce = () => {
      const timeout = setTimeout(() => {
        if (this.save.debounce) {
          debounce();
        } else {
          this.deleteFile();
        }
      }, wait++);
      return () => clearTimeout(timeout);
    };

    this.unlink.clear = debounce();
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
    if (this.save.debounce) {
      clearTimeout(this.save.debounce);
      this.save.debounce = null;
    }
    if (!this.saved) mkdir(path.dirname(this.path), this.options.mkdir);
    this.saved = true;
    fs.writeFileSync(this.path, this.json(), { mode: 0o0600 });
  }

  /**
   * Immediately delete the store from the file system. This method should probably
   * not be called directly. Unless you are familiar with the inner workings of
   * the code, it's recommended that you use .unlink() instead.
   *
   * ```js
   * store.deleteFile();
   * ```
   * @name .deleteFile
   * @return {undefined}
   */

  deleteFile() {
    if (this.unlink.clear) this.unlink.clear();
    tryUnlink(this.path);
  }

  /**
   * Load the store.
   * @return {object}
   */

  load() {
    try {
      return (this._data = JSON.parse(fs.readFileSync(this.path)));
    } catch (err) {
      if (err.code === 'EACCES') {
        err.message += '\ndata-store does not have permission to load this file\n';
        throw err;
      }
      if (err.code === 'ENOENT' || err.name === 'SyntaxError') {
        this._data = {};
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
   * @return {object}
   */

  set data(val) {
    this._data = val;
    this.save();
  }
  get data() {
    this._data = this._data || this.load();
    if (!this.saved) {
      this._data = Object.assign({}, this.defaults, this._data);
    }
    return this._data;
  }
}

/**
 * Utils
 */

const mode = opts => opts.mode || 0o777 & ~process.umask();

/**
 * Create a directory and any intermediate directories that might exist.
 */

function mkdir(dirname, options = {}) {
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
    if (err.code === 'EEXIST' || err.code === 'EISDIR') return;
    if (path.dirname(dir) === dir || !opts.fs.statSync(dir).isDirectory()) {
      throw err;
    }
  };
}

function tryUnlink(filepath) {
  try {
    fs.unlinkSync(filepath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}

function get(data = {}, prop = '') {
  return data[prop] == null
    ? split(prop).reduce((acc, k) => acc && acc[k], data)
    : data[prop];
}

function set(data = {}, prop = '', val) {
  return split(prop).reduce((acc, k, i, arr) => {
    let value = arr.length - 1 > i ? (acc[k] || {}) : val;
    if (!isObject(value) && i < arr.length - 1) value = {};
    return (acc[k] = value);
  }, data);
}

function del(data = {}, prop = '') {
  if (!prop) return false;
  if (data.hasOwnProperty(prop)) {
    delete data[prop];
    return true;
  }
  const segs = split(prop);
  const last = segs.pop();
  const val = segs.length ? get(data, segs.join('.')) : data;
  if (isObject(val) && val.hasOwnProperty(last)) {
    delete val[last];
    return true;
  }
}

function hasOwn(data = {}, prop = '') {
  if (!prop) return false;
  if (data.hasOwnProperty(prop)) return true;
  if (prop.indexOf('.') === -1) return false;
  const segs = split(prop);
  const last = segs.pop();
  const val = segs.length ? get(data, segs.join('.')) : data;
  return isObject(val) && val.hasOwnProperty(last);
}

function isObject(val) {
  return typeOf(val) === 'object';
}

function split(str) {
  const segs = str.split('.');
  for (let i = 0; i < segs.length; i++) {
    while (segs[i] && segs[i].slice(-1) === '\\') {
      segs[i] = segs[i].slice(0, -1) + '.' + segs.splice(i + 1, 1);
    }
  }
  return segs;
}

/**
 * Deeply clone plain objects and arrays.
 */

function cloneDeep(value) {
  const obj = {};
  switch (typeOf(value)) {
    case 'object':
      for (const key of Object.keys(value)) {
        obj[key] = cloneDeep(value[key]);
      }
      return obj;
    case 'array':
      return value.map(ele => cloneDeep(ele));
    default: {
      return value;
    }
  }
}

function typeOf(val) {
  if (typeof val === 'string') return 'string';
  if (Array.isArray(val)) return 'array';
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val && typeof val === 'object') {
    return 'object';
  }
}

/**
 * Expose `Store`
 */

module.exports = Store;
