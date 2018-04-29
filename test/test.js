'use strict';

require('mocha');
const fs = require('fs');
const path = require('path');
const del = require('delete');
const assert = require('assert');
const Store = require('..');
const tests = (...args) => path.resolve(__dirname, ...args);
const storePath = tests('fixtures/tests.json');
let store;

describe('store', function() {
  beforeEach(function() {
    store = new Store({ name: 'abc', path: storePath });
  });

  afterEach(function() {
    store.data = {};
    return del(tests('actual'));
  });

  describe('create', function() {
    it('should create an instance of Store', function() {
      assert(store instanceof Store);
    });

    it('should create a store with the given `name`', function() {
      store.set('foo', 'bar');
      assert(store.data.hasOwnProperty('foo'));
      assert.equal(store.data.foo, 'bar');
    });

    it('should initialize a store with the given defaults', function() {
      const defaults = { foo: 'bar', baz: 'qux' };
      store = new Store('abc', { base: storePath }, defaults);
      assert.equal(store.get('foo'), 'bar');
      assert.equal(store.get('baz'), 'qux');
    });

    it('should create a store using the given `indent` value', function() {
      store = new Store('abc', { base: storePath, indent: 0 });
      store.set('foo', 'bar');
      assert.deepEqual(store.load(), { foo: 'bar' });
    });
  });

  describe('set', function() {
    it('should `.set()` a value', function() {
      store.set('one', 'two');
      assert.equal(store.data.one, 'two');
    });

    it('should `.set()` an object', function() {
      store.set({ four: 'five', six: 'seven' });
      assert.equal(store.data.four, 'five');
      assert.equal(store.data.six, 'seven');
    });

    it('should `.set()` a nested value', function() {
      store.set('a.b.c.d', { e: 'f' });
      assert.equal(store.data.a.b.c.d.e, 'f');
    });

    it('should save data that is added directly to `storedata`', function() {
      store.data.foo = 'bar';
      store.set('a.b.c.d', { e: 'f' });
      assert.equal(store.data.a.b.c.d.e, 'f');
      assert.equal(store.data.foo, 'bar');
    });
  });

  describe('union', function() {
    it('should add and arrayify a new value', function() {
      store.union('one', 'two');
      assert.deepEqual(store.data.one, ['two']);
    });

    it('should uniquify duplicate values', function() {
      store.union('one', 'two');
      assert.deepEqual(store.data.one, ['two']);

      store.union('one', ['two']);
      assert.deepEqual(store.data.one, ['two']);
    });

    it('should union an existing value', function() {
      store.union('one', 'a');
      assert.deepEqual(store.data.one, ['a']);

      store.union('one', ['b']);
      assert.deepEqual(store.data.one, ['a', 'b']);

      store.union('one', ['c', 'd']);
      assert.deepEqual(store.data.one, ['a', 'b', 'c', 'd']);
    });
  });

  describe('has', function() {
    it('should return true if a key has a value', function() {
      store.set('foo', 'bar');
      store.set('baz', null);
      store.set('qux', undefined);

      assert(store.has('foo'));
      assert(store.has('baz'));
      assert(!store.has('bar'));
      assert(!store.has('qux'));
    });

    it('should return true if a nested key has a value', function() {
      store.set('a.b.c.d', { x: 'zzz' });
      store.set('a.b.c.e', { f: null });
      store.set('a.b.g.j', { k: undefined });

      assert(store.has('a.b.c.d'));
      assert(store.has('a.b.c.d.x'));
      assert(store.has('a.b.c.e'));
      assert(store.has('a.b.g.j'));
      assert(store.has('a.b.c.e.f'));

      assert(!store.has('a.b.bar'));
      assert(!store.has('a.b.c.d.z'));
      assert(!store.has('a.b.c.e.z'));
      assert(!store.has('a.b.g.j.k'));
      assert(!store.has('a.b.g.j.z'));
    });
  });

  describe('hasOwn', function() {
    it('should return true if a key exists', function() {
      store.set('foo', 'bar');
      store.set('baz', null);
      store.set('qux', undefined);

      assert(!store.hasOwn('bar'));
      assert(store.hasOwn('foo'));
      assert(store.hasOwn('baz'));
      assert(store.hasOwn('qux'));
    });

    it('should work with escaped keys', function() {
      store.set('foo\\.baz', 'bar');
      store.set('baz', null);
      store.set('qux', undefined);

      assert(!store.hasOwn('foo'));
      assert(!store.hasOwn('bar'));
      assert(store.hasOwn('foo.baz'));
      assert(store.hasOwn('baz'));
      assert(store.hasOwn('qux'));

      store.set('foo\\.bar.baz\\.qux', 'fez');
      assert(store.hasOwn('foo\\.bar.baz\\.qux'));
    });

    it('should return true if a nested key exists', function() {
      store.set('a.b.c.d', { x: 'zzz' });
      store.set('a.b.c.e', { f: null });
      store.set('a.b.g.j', { k: undefined });

      assert(store.hasOwn('a.b.c.d'));
      assert(store.hasOwn('a.b.c.d.x'));
      assert(store.hasOwn('a.b.c.e.f'));
      assert(store.hasOwn('a.b.g.j.k'));
      assert(store.hasOwn('a.b.g.j.k'));
      assert(store.hasOwn('a.b.c.e.f'));

      assert(!store.hasOwn('a.b.bar'));
      assert(!store.hasOwn('a.b.c.d.z'));
      assert(!store.hasOwn('a.b.c.e.bar'));
      assert(!store.hasOwn('a.b.g.j.foo'));
    });
  });

  describe('get', function() {
    it('should `.get()` a stored value', function() {
      store.set('three', 'four');
      assert.equal(store.get('three'), 'four');
    });

    it('should `.get()` a nested value', function() {
      store.set({ a: { b: { c: 'd' } } });
      assert.equal(store.get('a.b.c'), 'd');
    });
  });

  describe('union', function() {
    it('should `.del()` a stored value', function() {
      store.set('a', 'b');
      store.set('c', 'd');
      assert(store.data.hasOwnProperty('a'));
      assert.equal(store.data.a, 'b');

      assert(store.data.hasOwnProperty('c'));
      assert.equal(store.data.c, 'd');

      store.del('a');
      store.del('c');
      assert(!store.data.hasOwnProperty('a'));
      assert(!store.data.hasOwnProperty('c'));
    });
  });

  describe('del', function() {
    it('should delete stored values', function() {
      store.set('a', 'b');
      store.set('c', 'd');
      store.set('e', 'f');
      store.del('a');
      store.del('c');
      store.del('e');
      assert.deepEqual(store.data, {});
    });

    it('should delete a nested stored value', function() {
      store.set('a.b.c', 'b');
      assert.deepEqual(store.data, { a: { b: { c: 'b' } } });
      store.del('a.b.c');
      assert.deepEqual(store.data, { a: { b: {} } });
      store.del('a.b');
      assert.deepEqual(store.data, { a: {} });
      store.del('a');
      assert.deepEqual(store.data, {});
    });

    it('should ignore nested properties that do not exist', function() {
      store.set('a.b.c', 'b');
      assert.deepEqual(store.data, { a: { b: { c: 'b' } } });
      store.del('a.b.c.d');
      assert.deepEqual(store.data, { a: { b: { c: 'b' } } });
    });

    it('should delete multiple stored values', function() {
      store.set('a', 'b');
      store.set('c', 'd');
      store.set('e', 'f');
      ['a', 'c', 'e'].forEach(v => store.del(v));
      assert.deepEqual(store.data, {});
    });
  });
});
