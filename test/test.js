'use strict';

require('mocha');
const fs = require('fs');
const path = require('path');
const del = require('delete');
const assert = require('assert');
const dataStore = require('..');
const tests = (...args) => path.resolve(__dirname, ...args);
const storePath = tests('fixtures/tests.json');
del.sync(storePath);
let store;

describe('store', () => {
  beforeEach(() => {
    assert(!fs.existsSync(storePath));
    store = dataStore({ name: 'abc', path: storePath, debounce: 0 });
  });

  afterEach(() => store.unlink());
  after(async() => {
    await store.unlink();
    await del(tests('fixtures'));
    await del(tests('actual'));
  });

  describe('create', () => {
    it('should create an instance of Store', () => {
      assert(store instanceof dataStore.Store);
    });

    it('should initialize store', cb => {
      store.set('foo', 'bar');
      setTimeout(() => {
        assert(fs.existsSync(store.path));
        cb();
      }, 10);
    });

    it('should allow debounce to be customized', cb => {
      store.debounce = 10;
      store.set('foo', 'bar');
      assert(!fs.existsSync(store.path));
      assert.equal(store.get('foo'), 'bar');
      assert(!fs.existsSync(store.path));

      setTimeout(() => {
        assert(fs.existsSync(store.path));
        cb();
      }, 20);
    });

    it('should not create path until after debounce', cb => {
      store.debounce = 100;
      store.set('foo', 'bar');
      assert(!fs.existsSync(store.path));
      assert.equal(store.get('foo'), 'bar');
      assert(!fs.existsSync(store.path));

      setTimeout(() => {
        assert(!fs.existsSync(store.path));
        cb();
      }, 10);
    });

    it('should create a store with the given `name`', () => {
      store.set('foo', 'bar');
      assert.equal(store.data.foo, 'bar');
    });

    it('should initialize a store with the given defaults', () => {
      const defaults = { foo: 'bar', baz: 'qux' };
      store = dataStore('abc', { path: storePath }, defaults);
      assert.equal(store.get('foo'), 'bar');
      assert.equal(store.get('baz'), 'qux');
    });
  });

  describe('set', () => {
    it('should `.set()` a value', () => {
      store.set('one', 'two');
      assert.equal(store.data.one, 'two');
    });

    it('should `.set()` an object', () => {
      store.set({ four: 'five', six: 'seven' });
      assert.equal(store.data.four, 'five');
      assert.equal(store.data.six, 'seven');
    });

    it('should `.set()` a nested value', () => {
      store.set('a.b.c.d', { e: 'f' });
      assert.equal(store.data.a.b.c.d.e, 'f');
    });

    it('should save data that is added directly to `storedata`', () => {
      store.data.foo = 'bar';
      store.set('a.b.c.d', { e: 'f' });
      assert.equal(store.data.a.b.c.d.e, 'f');
      assert.equal(store.data.foo, 'bar');
    });
  });

  describe('merge', () => {
    it('should allow adding to an existing map', () => {
      store.merge('a', { b : 'c' });
      store.merge('d', { e : 'f' });
      store.set('g', { h : 'i' });
      assert.equal(store.data.a.b, 'c');
      assert.equal(store.data.d.e, 'f');
      assert.equal(store.data.g.h, 'i');
    });

    it('should allow overriding an existing key in an existing map', () => {
      store.merge('a', { b : 'c' });
      store.merge('d', { e : 'f' });
      store.set('g', { h : 'i' });
      store.merge('d', { e : 'j' });
      assert.equal(store.data.a.b, 'c');
      assert.equal(store.data.d.e, 'j');
      assert.equal(store.data.g.h, 'i');
    });

    it('should just overwrite if merge to non-object', () => {
      store.set('a', 'b');
      store.merge('a', { c : 'd' });
      assert.equal(store.data.a.c, 'd');
    });
  });

  describe('union', () => {
    it('should add and arrayify a new value', () => {
      store.union('one', 'two');
      assert.deepEqual(store.data.one, ['two']);
    });

    it('should uniquify duplicate values', () => {
      store.union('one', 'two');
      assert.deepEqual(store.data.one, ['two']);

      store.union('one', ['two']);
      assert.deepEqual(store.data.one, ['two']);
    });

    it('should union an existing value', () => {
      store.union('one', 'a');
      assert.deepEqual(store.data.one, ['a']);

      store.union('one', ['b']);
      assert.deepEqual(store.data.one, ['a', 'b']);

      store.union('one', ['c', 'd']);
      assert.deepEqual(store.data.one, ['a', 'b', 'c', 'd']);
    });
  });

  describe('has', () => {
    it('should return true if a key has a value', () => {
      store.set('foo', 'bar');
      store.set('baz', null);
      store.set('qux', undefined);

      assert(store.has('foo'));
      assert(store.has('baz'));
      assert(!store.has('bar'));
      assert(!store.has('qux'));
    });

    it('should return true if a nested key has a value', () => {
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

  describe('hasOwn', () => {
    it('should return true if a key exists', () => {
      store.set('foo', 'bar');
      store.set('baz', null);
      store.set('qux', 5);

      assert(!store.hasOwn('bar'));
      assert(store.hasOwn('foo'));
      assert(store.hasOwn('baz'));
      assert(store.hasOwn('qux'));
    });

    it('should work with escaped keys', () => {
      store.set('foo\\.baz', 'bar');
      store.set('baz', null);
      store.set('qux', 5);

      assert(!store.hasOwn('foo'));
      assert(!store.hasOwn('bar'));
      assert(store.hasOwn('foo.baz'));
      assert(store.hasOwn('baz'));
      assert(store.hasOwn('qux'));

      store.set('foo\\.bar.baz\\.qux', 'fez');
      assert(store.hasOwn('foo\\.bar.baz\\.qux'));
    });

    it('should return true if a nested key exists', () => {
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

  describe('get', () => {
    it('should `.get()` a stored value', () => {
      store.set('three', 'four');
      assert.equal(store.get('three'), 'four');
    });

    it('should `.get()` a nested value', () => {
      store.set({ a: { b: { c: 'd' } } });
      assert.equal(store.get('a.b.c'), 'd');
    });

    it('should `.get()` a nested value with escaped dot', () => {
      store.set({ 'a.b': { c: 'd' } });
      assert.equal(store.get('a\\.b.c'), 'd');
    });
  });

  describe('union', () => {
    it('should `.del()` a stored value', () => {
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

  describe('del', () => {
    it('should delete stored values', () => {
      store.set('a', 'b');
      store.set('c', 'd');
      store.set('e', 'f');
      store.del('a');
      store.del('c');
      store.del('e');
      assert.deepEqual(store.data, {});
    });

    it('should delete a nested stored value', () => {
      store.set('a.b.c', 'b');
      assert.deepEqual(store.data, { a: { b: { c: 'b' } } });
      store.del('a.b.c');
      assert.deepEqual(store.data, { a: { b: {} } });
      store.del('a.b');
      assert.deepEqual(store.data, { a: {} });
      store.del('a');
      assert.deepEqual(store.data, {});
    });

    it('should ignore nested properties that do not exist', () => {
      store.set('a.b.c', 'b');
      assert.deepEqual(store.data, { a: { b: { c: 'b' } } });
      store.del('a.b.c.d');
      assert.deepEqual(store.data, { a: { b: { c: 'b' } } });
    });

    it('should delete multiple stored values', () => {
      store.set('a', 'b');
      store.set('c', 'd');
      store.set('e', 'f');
      ['a', 'c', 'e'].forEach(v => store.del(v));
      assert.deepEqual(store.data, {});
    });
  });

  describe('json', () => {
    it('should use the indent value defined on ctor options', () => {
      store = dataStore('abc', { path: storePath, indent: 0 });
      store.set('foo', 'bar');
      assert.equal(store.json(), '{"foo":"bar"}')
    });
  });
});
