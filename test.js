/*!
 * data-store <https://github.com/jonschlinkert/data-store>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/* deps: mocha */
require('should');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var Store = require('./');
var store;

describe('store', function () {
  afterEach(function () {
    store.del({force: true});
  });

  it('should create an instance of Store', function () {
    store = new Store('abc');
    assert(store instanceof Store);
  });

  it('should throw an error if first arg is invalid', function (done) {
    try {
      new Store();
      done(new Error('expected an error'));
    } catch(err) {
      assert(err);
      assert(err.message);
      assert(err.message === 'expected a string as the first argument');
      done();
    }
  });

  it('should create a store with the given `name`', function () {
    store = new Store('abc');
    store.set('foo', 'bar');
    store.data.should.have.property('foo', 'bar');
  });

  it('should return an instance without `new`:', function () {
    store = Store('abc');
    store.set('foo', 'zzz');
    store.data.should.have.property('foo', 'zzz');
  });

  it('should create a store at the given `cwd`', function () {
    store = new Store('abc', {cwd: 'actual'});

    store.set('foo', 'bar');
    path.basename(store.path).should.equal('abc.json');
    store.data.should.have.property('foo', 'bar');
    assert.equal(fs.existsSync(path.join(__dirname, 'actual', 'abc.json')), true);
  });

  it('should create a store using the given `indent` value', function () {
    store = new Store('abc', {cwd: 'actual', indent: 0});
    store.set('foo', 'bar');
    var contents = fs.readFileSync(path.join(__dirname, 'actual', 'abc.json'), 'utf8');
    assert.equal(contents, '{"foo":"bar"}');
  });

  it('should `.set()` a value on the store', function () {
    store = new Store('aaa');
    store.set('one', 'two');
    store.data.one.should.equal('two');
  });

  it('should `.set()` an object', function () {
    store = new Store('aaa');
    store.set({four: 'five', six: 'seven'});
    store.data.four.should.equal('five');
    store.data.six.should.equal('seven');
  });

  it('should `.set()` a nested value', function () {
    store = new Store('aaa');
    store.set('a.b.c.d', {e: 'f'});
    store.data.a.b.c.d.e.should.equal('f');
  });

  it('should `.union()` a value on the store', function () {
    store = new Store('aaa');
    store.union('one', 'two');
    store.data.one.should.eql(['two']);
  });

  it('should not union duplicate values', function () {
    store = new Store('aaa');
    store.union('one', 'two');
    store.data.one.should.eql(['two']);

    store.union('one', ['two']);
    store.data.one.should.eql(['two']);
  });

  it('should concat an existing array:', function () {
    store = new Store('aaa');
    store.union('one', 'a');
    store.data.one.should.eql(['a']);

    store.union('one', ['b']);
    store.data.one.should.eql(['a', 'b']);

    store.union('one', ['c', 'd']);
    store.data.one.should.eql(['a', 'b', 'c', 'd']);
  });

  it('should return true if a key `.has()` on the store', function () {
    store = new Store('eee');
    store.set('foo', 'bar');
    store.set('baz', null);
    store.set('qux', undefined);

    store.has('foo').should.eql(true);
    store.has('bar').should.eql(false);
    store.has('baz').should.eql(false);
    store.has('qux').should.eql(false);
  });

  it('should return true if a nested key `.has()` on the store', function () {
    store = new Store('xxx');
    store.set('a.b.c.d', {x: 'zzz'});
    store.set('a.b.c.e', {f: null});
    store.set('a.b.g.j', {k: undefined});

    store.has('a.b.bar').should.eql(false);
    store.has('a.b.c.d').should.eql(true);
    store.has('a.b.c.d.x').should.eql(true);
    store.has('a.b.c.d.z').should.eql(false);
    store.has('a.b.c.e').should.eql(true);
    store.has('a.b.c.e.f').should.eql(false);
    store.has('a.b.c.e.z').should.eql(false);
    store.has('a.b.g.j').should.eql(true);
    store.has('a.b.g.j.k').should.eql(false);
    store.has('a.b.g.j.z').should.eql(false);
  });

   it('should return true if a key exists `.hasOwn()` on the store', function () {
    store = new Store('eee');
    store.set('foo', 'bar');
    store.set('baz', null);
    store.set('qux', undefined);

    store.hasOwn('foo').should.eql(true);
    store.hasOwn('bar').should.eql(false);
    store.hasOwn('baz').should.eql(true);
    store.hasOwn('qux').should.eql(true);
  });

  it('should return true if a nested key exists `.hasOwn()` on the store', function () {
    store = new Store('xxx');
    store.set('a.b.c.d', {x: 'zzz'});
    store.set('a.b.c.e', {f: null});
    store.set('a.b.g.j', {k: undefined});

    store.hasOwn('a.b.bar').should.eql(false);
    store.hasOwn('a.b.c.d').should.eql(true);
    store.hasOwn('a.b.c.d.x').should.eql(true);
    store.hasOwn('a.b.c.d.z').should.eql(false);
    store.has('a.b.c.e.f').should.eql(false);
    store.hasOwn('a.b.c.e.f').should.eql(true);
    store.hasOwn('a.b.c.e.bar').should.eql(false);
    store.has('a.b.g.j.k').should.eql(false);
    store.hasOwn('a.b.g.j.k').should.eql(true);
    store.hasOwn('a.b.g.j.foo').should.eql(false);
  });

  it('should `.get()` a stored value', function () {
    store = new Store('bbb');
    store.set('three', 'four');
    store.get('three').should.equal('four');
  });

  it('should `.get()` a nested value', function () {
    store = new Store('bbb');
    store.set({a: {b: {c: 'd'}}});
    store.get('a.b.c').should.equal('d');
  });

  it('should `.del()` a stored value', function () {
    store = new Store('ccc');
    store.set('a', 'b');
    store.set('c', 'd');
    store.data.should.have.property('a');
    store.data.should.have.property('c');

    store.del('a');
    store.del('c');
    store.data.should.not.have.property('a');
    store.data.should.not.have.property('c');
  });

  it('should `.del()` multiple stored values', function () {
    store = new Store('ddd');
    store.set('a', 'b');
    store.set('c', 'd');
    store.set('e', 'f');
    store.del(['a', 'c', 'e']);
    store.data.should.eql({});
  });
});

describe('events', function () {
  it('should emit `set` when an object is set:', function () {
    store = new Store('bbb');
    var keys = [];

    store.on('set', function (key) {
      keys.push(key);
    });

    store.set({a: {b: {c: 'd'}}});
    keys.should.eql(['a']);
  });

  it('should emit `set` when a key/value pair is set:', function () {
    store = new Store('bbb');
    var keys = [];

    store.on('set', function (key) {
      keys.push(key);
    });

    store.set('a', 'b');
    keys.should.eql(['a']);
  });

  it('should emit `set` when an object value is set:', function () {
    store = new Store('bbb');
    var keys = [];

    store.on('set', function (key) {
      keys.push(key);
    });

    store.set('a', {b: 'c'});
    keys.should.eql(['a']);
  });

  it('should emit `set` when an array of objects is passed:', function () {
    store = new Store('bbb');
    var keys = [];

    store.on('set', function (key) {
      keys.push(key);
    });

    store.set([{a: 'b'}, {c: 'd'}]);
    keys.should.eql(['a', 'c']);
  });

  it('should emit `del` when a value is delted:', function (done) {
    store = new Store('bbb');

    store.on('del', function (keys) {
      keys.should.eql('a');
      assert(typeof store.get('a') === 'undefined');
      done();
    });

    store.set('a', {b: 'c'});
    store.get('a').should.eql({b: 'c'});
    store.del('a');
  });

  it('should emit deleted keys on `del`:', function (done) {
    store = new Store('bbb');

    store.on('del', function (keys) {
      keys.should.eql(['c', 'a', 'e']);
      assert(Object.keys(store.data).length === 0);
      done();
    });

    store.set('a', 'b');
    store.set('c', 'd');
    store.set('e', 'f');
    store.data.should.have.properties(['a', 'c', 'e']);
    store.del({force: true});
  });

  it('should expose `err` to a callback:', function () {
    store = new Store('lll');
    store.set('a', 'b');
    store.set('c', 'd');
    store.set('e', 'f');

    (function () {
      store.del();
    }).should.throw('options.force is required to delete the entire cache.');
  });

  it('should expose `err` to a callback:', function (done) {
    store = new Store('lll');
    store.set('a', 'b');
    store.set('c', 'd');
    store.set('e', 'f');

    store.del({force: true}, function (err, keys) {
      keys.should.eql(['a', 'c', 'e']);
      assert(Object.keys(store.data).length === 0);
      done();
    });
  });
});
