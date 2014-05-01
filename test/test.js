/**
  * data-store <https://github.com/assemble/data-store>
  *
  * Copyright (c) 2014, Jon Schlinkert, Brian Woodward, contributors.
  * Licensed under the MIT License
  *
  */

var file = require('fs-utils');
var cheerio = require('cheerio');
var expect = require('chai').expect;
var dataStore = require('../');

var basic = file.readFileSync('test/fixtures/basic.html');
var body = file.readFileSync('test/fixtures/body.html');
var custom = file.readFileSync('test/fixtures/custom.html');
var noBody = file.readFileSync('test/fixtures/noBody.md');
var noMatter = file.readFileSync('test/fixtures/noMatter.md');

var str = file.readFileSync('test/actual/index.html');

describe('data-store:', function() {
  describe('when HTML with a body tag is passed', function() {
    it('should append a script tag to the body', function() {
      // Arbitrary object, to extend the context
      var obj = {basename: 'foo', ext: '.html'};
      var store = dataStore(body);
      console.log(store)
      store.set('metadata', obj);
      var actual = store.get('metadata');
      expect(actual).to.have.property('basename');
      expect(actual).to.have.property('a');
    });

    it('should append a script tag to the HTML', function() {
      var obj = {basename: 'foo', ext: '.html'};
      var store = dataStore(noBody);
      store.set('metadata', obj);
      var actual = store.html;
      expect(/basename/.test(actual)).to.eql(true);
    });

    it('should append a script tag to the HTML', function() {
      var store = dataStore(basic);
      store.set('metadata');
      file.writeFileSync('test/actual/basic.html', store.html);
      var actual = store.get('metadata');
      expect(actual).to.have.property('title');
    });

    it('should append a script tag to the HTML', function() {
      var store = dataStore(custom);
      store.set('foo', {name: "Jon Schlinkert"});
      var actual = store.get('foo');
      expect(actual).to.have.property('name');
    });

    it('should append a script tag to the HTML', function() {
      var obj = {basename: 'foo', ext: '.html'};
      var store = dataStore(noBody);
      store.set('metadata', obj);
      var actual = store.get('metadata');
      expect(actual).to.have.property('basename');
    });

    it('should append a script tag to the HTML', function() {
      var store = dataStore(noBody);
      store.set('metadata');
      var actual = store.get('metadata');
      expect(actual).to.have.property('title');
    });

    it('should append a script tag to the HTML', function() {
      var obj = {basename: 'foo', ext: '.html'};
      var store = dataStore(noBody);
      store.set(obj);
      var actual = store.get('metadata');
      expect(actual).to.have.property('basename');
    });
  });

  describe('when HTML with no front metadata is passed', function() {
    it('should append a script tag to the HTML', function() {
      var obj = {basename: 'foo', ext: '.html'};
      var store = dataStore(noMatter);
      store.set(obj);
      var actual = store.get('metadata');
      expect(actual).to.have.property('basename');
    });

    it('should append a script tag to the HTML', function() {
      var obj = {foo: 'foo', bar: 'bar'};
      var store = dataStore(noBody);
      store.set('some', obj);
      var actual = store.get('some');
      expect(actual).to.have.property('bar');
    });

    it('should append a script tag to the HTML', function() {
      var obj = {foo: 'foo', bar: 'bar'};
      var store = dataStore(noBody);
      store.set(obj);
      var actual = store.get();
      expect(actual).to.have.property('bar');
    });

    it('should append a script tag to the HTML', function() {
      var obj = {foo: 'foo', bar: 'bar'};
      var store = dataStore(noBody);
      store.set('dupid', obj);
      obj.baz = 'bang';
      store.set('dupid', obj);
      var actual = store.get('dupid');
      expect(actual).to.have.property('baz');
    });
  });
});
