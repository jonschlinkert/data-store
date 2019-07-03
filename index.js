'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const xdg = require('@folder/xdg');
const utils = require('./utils');

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

    if (!options.path) {
      assert.equal(typeof name, 'string', 'expected store name to be a string');
    }

    let { debounce = 0, indent = 2, home, base, namespace } = options;
    let dirs = xdg(options.xdg);

    this.name = name || path.basename(options.path, path.extname(options.path));
    this.options = options;
    this.defaults = defaults || options.default;
    this.debounce = debounce;
    this.namespace = namespace;
    this.indent = indent;

    if (!home) home = dirs.config || path.join(dirs.home, '.config');
    if (!base) base = options.cwd || path.join(home, 'data-store');
    this.path = this.options.path || path.join(base, `${this.name}.json`);
    this.base = path.dirname(this.path);
    this.timeouts = {};
  }

  prop(key) {
    return this.namespace ? `${this.namespace}.${key}` : key;
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
    if (typeof key === 'string' && val === void 0) {
      return this.del(key);
    }

    if (utils.isObject(key)) {
      for (let k of Object.keys(key)) {
        this.set(k.split(/\\?\./).join('\\.'), key[k]);
      }
    } else {
      assert.equal(typeof key, 'string', 'expected key to be a string');
      utils.set(this.data, this.prop(key), val);
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
    let values = this.get(key);
    let arr = [].concat(utils.isEmptyPrimitive(values) ? [] : values);
    this.set(key, utils.unique(utils.flatten(...arr, ...rest)));
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

  get(key, fallback) {
    assert.equal(typeof key, 'string', 'expected key to be a string');
    let value = utils.get(this.data, this.prop(key));
    if (value === void 0) {
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
   * @param {string} `key`
   * @return {boolean} Returns true if `key` has
   * @api public
   */

  has(key) {
    return this.get(key) !== void 0;
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
    return utils.hasOwn(this.data, this.prop(key));
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
      for (let k of key) this.del(k);
      return this;
    }
    assert.equal(typeof key, 'string', 'expected key to be a string');
    if (utils.del(this.data, this.prop(key))) {
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
    if (this.namespace) {
      let data = this.data[this.namespace];
      return data ? utils.cloneDeep(data) : void 0;
    }
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
    if (this.namespace) {
      this.data[this.namespace] = {};
    } else {
      this.data = {};
    }
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
    let write = this.writeFile.bind(this);
    if (!this.debounce) return write();
    if (this.timeouts.save) clearTimeout(this.timeouts.save);
    this.timeouts.save = setTimeout(write, this.debounce);
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
    utils.mkdir(path.dirname(this.path), this.options.mkdir);
    fs.writeFileSync(this.path, this.json(), { mode: 0o0600 });
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

  // DEPRECATED: will be removed in the next major release
  deleteFile() {
    return this.unlink();
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

  set data(data) {
    this._data = data;
    this.save();
  }
  get data() {
    let data = this._data || this.load();
    if (!this.saved) {
      data = { ...this.defaults, ...data };
    }
    this._data = data;
    return data;
  }
}

/**
 * Expose `Store`
 */

module.exports = (...args) => new Store(...args)
module.exports.Store = Store;
