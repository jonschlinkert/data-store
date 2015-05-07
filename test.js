/*!
 * data-store <https://github.com/jonschlinkert/data-store>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
var path = require('path');
var assert = require('assert');
var Store = require('./');
var store;

describe('store', function () {
  afterEach(function () {
    store.del({force: true});
  });

  it('should create a store with the given `name`', function () {
    store = new Store('abc');

    store.set('foo', 'bar');
    store.data.should.have.property('foo', 'bar');
  });

  it('should create a store at the given `cwd`', function () {
    store = new Store('abc', 'actual');

    store.set('foo', 'bar');
    path.basename(store.path).should.equal('abc.json');
    store.data.should.have.property('foo', 'bar');
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

  it('should return true if a key `.has()` on the store', function () {
    store = new Store('eee');
    store.set('ggg', 'fff');
    store.has('ggg').should.be.true;
  });

  it('should return true if a nested key `.has()` on the store', function () {
    store = new Store('xxx');
    store.set('a.b.c.d', {x: 'zzz'});
    store.has('a.b.c.d.x').should.be.true;
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

  it('should `.omit()` a stored value', function () {
    store = new Store('ccc');
    store.set('a', 'b');
    store.set('c', 'd');
    store.omit('a');
    store.should.not.have.property('a');
  });

  it('should `.omit()` multiple stored values', function () {
    store = new Store('ddd');
    store.set('a', 'b');
    store.set('c', 'd');
    store.set('e', 'f');
    store.omit(['a', 'c', 'e']);
    store.data.should.eql({});
  });
});

describe('events', function () {
  it('should emit `set` when an object is set:', function () {
    store = new Store('bbb');
    var res;

    store.on('set', function (keys) {
      keys.should.eql(['a']);
    });

    store.set({a: {b: {c: 'd'}}});
  });

  it('should emit `set` when a key/value pair is set:', function () {
    store = new Store('bbb');
    var res;

    store.on('set', function (keys) {
      keys.should.eql(['a']);
    });

    store.set('a', 'b');
  });

  it('should emit `set` when an object value is set:', function () {
    store = new Store('bbb');
    var res;

    store.on('set', function (keys) {
      keys.should.eql(['a']);
    });

    store.set('a', {b: 'c'});
  });

  it('should emit `omit` when a value is omitted:', function () {
    store = new Store('bbb');
    var res;

    store.on('omit', function (keys) {
      keys.should.eql(['a']);
      assert(typeof store.get('a') === 'undefined');
    });

    store.set('a', {b: 'c'});
    store.get('a').should.eql({b: 'c'});
    store.omit('a');
  });

  it('should emit deleted keys on `del`:', function () {
    store = new Store('bbb');
    var res;

    store.on('del', function (keys) {
      keys.should.eql(['a', 'c', 'e']);
      assert(Object.keys(store.data).length === 0);
    });

    store.set('a', 'b');
    store.set('c', 'd');
    store.set('e', 'f');
    store.data.should.have.properties(['a', 'c', 'e']);
    store.del({force: true});
  });
});
