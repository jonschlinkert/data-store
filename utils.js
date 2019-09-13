'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const get = require('get-value');

const split = str => {
  const segs = str.split('.');
  for (let i = 0; i < segs.length; i++) {
    while (segs[i] && segs[i].slice(-1) === '\\') {
      segs[i] = segs[i].slice(0, -1) + '.' + segs.splice(i + 1, 1);
    }
  }
  return segs;
};

exports.stem = filepath => path.basename(filepath, path.extname(filepath));

exports.flatten = (...args) => [].concat.apply([], args);
exports.unique = arr => arr.filter((ele, i) => arr.indexOf(ele) === i);

exports.isEmptyPrimitive = value => {
  return value === '' || value === void 0 || value === null;
};

exports.del = (obj = {}, prop = '') => {
  if (!prop) return false;
  if (obj.hasOwnProperty(prop)) {
    delete obj[prop];
    return true;
  }
  const segs = split(prop);
  const last = segs.pop();
  const val = segs.length ? get(obj, segs.join('.')) : obj;
  if (exports.isObject(val) && val.hasOwnProperty(last)) {
    delete val[last];
    return true;
  }
};

exports.hasOwn = (obj = {}, prop = '') => {
  if (!prop) return false;
  if (obj.hasOwnProperty(prop)) return true;
  const segs = split(prop);
  const last = segs.pop();
  if (!segs.length) return false;
  const val = get(obj, segs.join('.'));
  return exports.isObject(val) && val.hasOwnProperty(last);
};

/**
 * Deeply clone plain objects and arrays. We're only concerned with
 * cloning values that are valid in JSON.
 */

exports.cloneDeep = value => {
  const obj = {};
  switch (exports.typeOf(value)) {
    case 'object':
      for (const key of Object.keys(value)) {
        obj[key] = exports.cloneDeep(value[key]);
      }
      return obj;
    case 'array':
      return value.map(ele => exports.cloneDeep(ele));
    default: {
      return value;
    }
  }
};

exports.isObject = value => exports.typeOf(value) === 'object';

exports.typeOf = value => {
  if (value === null) return 'null';
  if (value === void 0) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Error) return 'error';
  if (value instanceof RegExp) return 'regexp';
  if (value instanceof Date) return 'date';
  return typeof value;
};

/**
 * Create a directory and any intermediate directories that might exist.
 */

exports.mkdir = (dirname, options = {}) => {
  assert.equal(typeof dirname, 'string', 'expected dirname to be a string');
  if (exports.directoryExists(dirname)) return;

  try {
    fs.mkdirSync(dirname, { ...options, recursive: true });
  } catch (err) {
    exports.handleError(dirname, err, options);
  }

  return dirname;
};

exports.directoryExists = (dirname, strict = true) => {
  const stat = exports.tryStat(dirname);
  if (stat) {
    if (strict && !stat.isDirectory()) {
      throw new Error(`Path exists and is not a directory: "${dirname}"`);
    }
    return true;
  }
  return false;
};

exports.handleError = (dirname, err, options = {}) => {
  if (/null bytes/.test(err.message)) throw err;

  const isIgnored = ['EEXIST', 'EISDIR', 'EPERM'].includes(err.code)
    && options.fs.statSync(dirname).isDirectory()
    && path.dirname(dirname) !== dirname;

  if (!isIgnored) {
    throw err;
  }
};

exports.tryStat = filepath => {
  try {
    return fs.statSync(filepath);
  } catch (err) {
    return null;
  }
};

exports.tryUnlink = (filepath) => {
  try {
    fs.unlinkSync(filepath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
};
