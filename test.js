/*!
 * data-store <https://github.com/jonschlinkert/data-store>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Store = require('./');
var store;

describe('store', function () {
  afterEach(function () {
    store.delete({force: true});
  });
  it('should create a store with the given `name`', function () {
    store = new Store('abc');

    store.set('foo', 'bar');
    store.config.should.have.property('foo', 'bar');
  });

  it('should create a store at the given `cwd`', function () {
    store = new Store('abc', 'actual');

    store.set('foo', 'bar');
    store.path.should.equal('actual/.data.abc.json');
    store.config.should.have.property('foo', 'bar');
  });

  it('should `.set()` a value on the store', function () {
    store = new Store('aaa');
    store.set('one', 'two');
    store.config.one.should.equal('two');
  });

  it('should return true if a key `.exists()` on the store', function () {
    store = new Store('eee');
    store.set('ggg', 'fff');
    store.exists('ggg').should.be.true;
  });

  it('should `.get()` a stored value', function () {
    store = new Store('bbb');
    store.set('three', 'four');
    store.get('three').should.equal('four');
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
    store.config.should.eql({});
  });
});
