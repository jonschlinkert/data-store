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
  it('should create a store with the given `name`', function () {
    store = new Store('abc');

    store.set('foo', 'bar');
    store.should.have.property('name', 'abc');
    store.delete();
  });

  // it('should create a store at the given `dest`', function () {
  //   // store = new Store('abc', 'actual/abc.json');

  //   // store.set('foo', 'bar');
  //   // console.log(store)
  //   // store.should.have.property('abc');
  // });

  // it('should equal', function () {
  //   var store = new Store();

  //   store({a: 'b'}).should.eql({a: 'b'});
  //   store('abc').should.equal('abc');
  // });

  // it('should have property.', function () {
  //   store({a: 'b'}).should.have.property('a', 'b');
  // });
});

// var store = new Store('foo');

// store
//   .set('a', 'b')
//   .set('c', 'd')
//   .set('e', 'f');

// store.save();
// store.omit('a');

// console.log(store.get());