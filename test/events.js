'use strict';

require('mocha');
const path = require('path');
const assert = require('assert');
const Store = require('..');
const tests = (...args) => path.resolve(__dirname, ...args);
const storePath = tests('fixtures/tests.json');
let store;

describe('events', function() {
  beforeEach(function() {
    store = new Store({ name: 'abc', path: storePath });
  });

  afterEach(function() {
    store.data = {};
  });

  describe('set', function() {
    it('should emit `set` when an object is set:', function() {
      const keys = [];
      store.on('set', function(key) {
        keys.push(key);
      });

      store.set({ a: { b: { c: 'd' } } });
      assert.deepEqual(keys, ['a']);
    });

    it('should emit `set` when a key/value pair is set:', function() {
      const keys = [];

      store.on('set', function(key) {
        keys.push(key);
      });

      store.set('a', 'b');
      assert.deepEqual(keys, ['a']);
    });

    it('should emit `set` when an object value is set:', function() {
      const keys = [];

      store.on('set', function(key) {
        keys.push(key);
      });

      store.set('a', { b: 'c' });
      assert.deepEqual(keys, ['a']);
    });

    it('should emit `set` when an array of objects is passed:', function() {
      const keys = [];

      store.on('set', function(key) {
        keys.push(key);
      });

      store.set([{ a: 'b' }, { c: 'd' }]);
      assert.deepEqual(keys, ['a', 'c']);
    });
  });

  describe('del', function() {
    it('should emit `del` when a value is delted:', function(cb) {
      store.on('del', function(keys) {
        assert.deepEqual(keys, 'a');
        assert.equal(typeof store.get('a'), 'undefined');
        cb();
      });

      store.set('a', { b: 'c' });
      assert.deepEqual(store.get('a'), { b: 'c' });
      store.del('a');
    });

    it('should emit deleted keys on `del`:', function(cb) {
      const arr = [];

      store.on('del', key => arr.push(key));
      store.set('a', 'b');
      store.set('c', 'd');
      store.set('e', 'f');

      store.del();

      assert.deepEqual(arr, ['a', 'c', 'e']);
      assert.equal(Object.keys(store.data).length, 0);
      cb();
    });
  });
});
