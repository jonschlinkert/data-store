/*!
 * data-store <https://github.com/jonschlinkert/data-store>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var Store = require('./');
var store;

describe('store', function() {
  beforeEach(function() {
    store = new Store('abc');
  });

  afterEach(function() {
    store.data = {};
    store.del({force: true});
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

    it('should return an instance without `new`:', function() {
      store = Store('abc');
      store.set('foo', 'zzz');
      assert(store.data.hasOwnProperty('foo'));
      assert.equal(store.data.foo, 'zzz');
    });

    it('should create a store at the given `cwd`', function() {
      store = new Store('abc', {cwd: 'actual'});

      store.set('foo', 'bar');
      assert.equal(path.basename(store.path), 'abc.json');
      assert(store.data.hasOwnProperty('foo'));
      assert.equal(store.data.foo, 'bar');
      assert.equal(fs.existsSync(path.join(__dirname, 'actual/abc.json')), true);
    });

    it('should create a store using the given `indent` value', function() {
      store = new Store('abc', {cwd: 'actual', indent: 0});
      store.set('foo', 'bar');
      var contents = fs.readFileSync(path.join(__dirname, 'actual/abc.json'), 'utf8');
      assert.equal(contents, '{"foo":"bar"}');
    });
  });

  describe('sub-store', function() {
    it('should create a "sub-store" with the given name', function() {
      var created = store.create('created');
      assert.equal(created.name, 'created');
    });

    it('should create a "sub-store" with the project name when no name is passed', function() {
      var foo = store.create();
      assert.equal(foo.name, 'data-store');
    });

    it('should set values on a sub-store', function() {
      var foo = store.create('created');
      foo.set('one', 'two');
      assert.equal(foo.get('one'), 'two');
    });
  });

  describe('set', function() {
    it('should `.set()` a value on the store', function() {
      store.set('one', 'two');
      assert.equal(store.data.one, 'two');
    });

    it('should `.set()` an object', function() {
      store.set({four: 'five', six: 'seven'});
      assert.equal(store.data.four, 'five');
      assert.equal(store.data.six, 'seven');
    });

    it('should `.set()` a nested value', function() {
      store.set('a.b.c.d', {e: 'f'});
      assert.equal(store.data.a.b.c.d.e, 'f');
    });

    it('should not save data that is added directly to `storedata`', function() {
      store.data.foo = 'bar';
      store.set('a.b.c.d', {e: 'f'});
      assert.equal(store.data.a.b.c.d.e, 'f');
      assert.equal(typeof store.data.foo, 'undefined');
    });
  });

  describe('union', function() {
    it('should `.union()` a value on the store', function() {
      store.union('one', 'two');
      assert.deepEqual(store.data.one, ['two']);
    });

    it('should not union duplicate values', function() {
      store.union('one', 'two');
      assert.deepEqual(store.data.one, ['two']);

      store.union('one', ['two']);
      assert.deepEqual(store.data.one, ['two']);
    });

    it('should concat an existing array:', function() {
      store.union('one', 'a');
      assert.deepEqual(store.data.one, ['a']);

      store.union('one', ['b']);
      assert.deepEqual(store.data.one, ['a', 'b']);

      store.union('one', ['c', 'd']);
      assert.deepEqual(store.data.one, ['a', 'b', 'c', 'd']);
    });
  });

  describe('has', function() {
    it('should return true if a key `.has()` on the store', function() {
      store.set('foo', 'bar');
      store.set('baz', null);
      store.set('qux', undefined);

      assert(store.has('foo'));
      assert(store.has('baz'));
      assert(!store.has('bar'));
      assert(!store.has('qux'));
    });

    it('should return true if a nested key `.has()` on the store', function() {
      store.set('a.b.c.d', {x: 'zzz'});
      store.set('a.b.c.e', {f: null});
      store.set('a.b.g.j', {k: undefined});

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
    it('should return true if a key exists `.hasOwn()` on the store', function() {
      store.set('foo', 'bar');
      store.set('baz', null);
      store.set('qux', undefined);

      assert(store.hasOwn('foo'));
      assert(!store.hasOwn('bar'));
      assert(store.hasOwn('baz'));
      assert(store.hasOwn('qux'));
    });

    it('should return true if a nested key exists `.hasOwn()` on the store', function() {
      store.set('a.b.c.d', {x: 'zzz'});
      store.set('a.b.c.e', {f: null});
      store.set('a.b.g.j', {k: undefined});

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
      store.set({a: {b: {c: 'd'}}});
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

    it('should `.del()` multiple stored values', function() {
      store.set('a', 'b');
      store.set('c', 'd');
      store.set('e', 'f');
      store.del(['a', 'c', 'e']);
      assert.deepEqual(store.data, {});
    });
  });
});

describe('events', function() {
  beforeEach(function() {
    store = new Store('abc');
  });

  afterEach(function() {
    store.data = {};
    store.del({force: true});
  });

  describe('set', function() {
    it('should emit `set` when an object is set:', function() {
      var keys = [];
      store.on('set', function(key) {
        keys.push(key);
      });

      store.set({a: {b: {c: 'd'}}});
      assert.deepEqual(keys, ['a']);
    });

    it('should emit `set` when a key/value pair is set:', function() {
      var keys = [];

      store.on('set', function(key) {
        keys.push(key);
      });

      store.set('a', 'b');
      assert.deepEqual(keys, ['a']);
    });

    it('should emit `set` when an object value is set:', function() {
      var keys = [];

      store.on('set', function(key) {
        keys.push(key);
      });

      store.set('a', {b: 'c'});
      assert.deepEqual(keys, ['a']);
    });

    it('should emit `set` when an array of objects is passed:', function() {
      var keys = [];

      store.on('set', function(key) {
        keys.push(key);
      });

      store.set([{a: 'b'}, {c: 'd'}]);
      assert.deepEqual(keys, ['a', 'c']);
    });
  });

  describe('has', function() {
    it('should emit `has`:', function(done) {
      var keys = [];

      store.on('has', function(val) {
        assert(val);
        done();
      });

      store.set('a', 'b');
      store.has('a');
    });
  });

  describe('del', function() {
    it('should emit `del` when a value is delted:', function(done) {
      store.on('del', function(keys) {
        assert.deepEqual(keys, 'a');
        assert(typeof store.get('a') === 'undefined');
        done();
      });

      store.set('a', {b: 'c'});
      assert.deepEqual(store.get('a'), {b: 'c'});
      store.del('a');
    });

    it('should emit deleted keys on `del`:', function(done) {
      var arr = [];

      store.on('del', function(key) {
        arr.push(key);
        assert(Object.keys(store.data).length === 0);
      });

      store.set('a', 'b');
      store.set('c', 'd');
      store.set('e', 'f');
      store.del({force: true});
      assert.deepEqual(arr, ['a', 'c', 'e']);
      done();
    });

    it('should throw an error if force is not passed', function(cb) {
      store.set('a', 'b');
      store.set('c', 'd');
      store.set('e', 'f');

      try {
        store.del();
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'options.force is required to delete the entire cache.');
        cb();
      }
    });
  });
});
