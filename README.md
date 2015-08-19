# data-store  [![Build Status](https://travis-ci.org/jonschlinkert/data-store.svg)](https://travis-ci.org/jonschlinkert/data-store)  [![NPM version](https://badge.fury.io/js/data-store.svg)](http://badge.fury.io/js/data-store)

> Easily get, set and persist config data.

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i data-store --save
```

## Usage example

```js
var Store = require('data-store');
// default cwd is `~/data-store/`
var store = new Store('app', {cwd: 'actual'});

store
  .set('a', 'b')
  .set('c.d', {e: 'f'})
  .set('c.d', {g: 'h'});

console.log(store.get('c.d'));
//=> { e: 'f', g: 'h' }

console.log(store.get());
//=> { name: 'app', data: { a: 'b', c: { d: { e: 'f', g: 'h' } } } }

console.log(store.data);
//=> { a: 'b', c: { d: { e: 'f', g: 'h' } } }
```

## API

### [Store](index.js#L58)

Initialize a new `Store` with the given `name` and `options`.

**Params**

* `name` **{String}**: Store name.
* `options` **{Object}**

- `cwd` **{String}**: Current working directory for storage. If not defined, the user home directory is used, based on OS. This is the only option currently, other may be added in the future.
- `indent` **{Number}**: Number passed to `JSON.stringify` when saving the data. Defaults to `2` if `null` or `undefined`

**Example**

```js
var store = new Store('abc');
//=> '~/data-store/a.json'

var store = new Store('abc', {cwd: 'test/fixtures'});
//=> './test/fixtures/abc.json'
```

### [.set](index.js#L104)

Assign `value` to `key` and save to disk. Can be a key-value pair or an object.

**Params**

* `key` **{String}**
* `val` **{any}**: The value to save to `key`. Must be a valid JSON type: String, Number, Array or Object.
* `returns` **{Object}** `Store`: for chaining

**Example**

```js
// key, value
store.set('a', 'b');
//=> {a: 'b'}

// extend the store with an object
store.set({a: 'b'});
//=> {a: 'b'}

// extend the the given value
store.set('a', {b: 'c'});
store.set('a', {d: 'e'}, true);
//=> {a: {b 'c', d: 'e'}}

// overwrite the the given value
store.set('a', {b: 'c'});
store.set('a', {d: 'e'});
//=> {d: 'e'}
```

### [.union](index.js#L140)

Add or append an array of unique values to the given `key`.

**Params**

* `key` **{String}**
* `returns` **{any}**: The array to add or append for `key`.

**Example**

```js
store.union('a', ['a']);
store.union('a', ['b']);
store.union('a', ['c']);
store.get('a');
//=> ['a', 'b', 'c']
```

### [.get](index.js#L166)

Get the stored `value` of `key`, or return the entire store if no `key` is defined.

**Params**

* `key` **{String}**
* `returns` **{any}**: The value to store for `key`.

**Example**

```js
store.set('a', {b: 'c'});
store.get('a');
//=> {b: 'c'}

store.get();
//=> {b: 'c'}
```

### [.has](index.js#L189)

Returns `true` if the specified `key` has truthy value.

**Params**

* `key` **{String}**
* `returns` **{Boolean}**: Returns true if `key` has

**Example**

```js
store.set('a', 'b');
store.set('c', null);
store.has('a'); //=> true
store.has('c'); //=> false
store.has('d'); //=> false
```

### [.hasOwn](index.js#L214)

Returns `true` if the specified `key` exists.

**Params**

* `key` **{String}**
* `returns` **{Boolean}**: Returns true if `key` exists

**Example**

```js
store.set('a', 'b');
store.set('b', false);
store.set('c', null);
store.set('d', true);

store.hasOwn('a'); //=> true
store.hasOwn('b'); //=> true
store.hasOwn('c'); //=> true
store.hasOwn('d'); //=> true
store.hasOwn('foo'); //=> false
```

### [.save](index.js#L231)

Persist the store to disk.

**Params**

* `dest` **{String}**: Optionally define an alternate destination file path.

**Example**

```js
store.save();
```

### [.del](index.js#L253)

Delete `keys` from the store, or delete the entire store if no keys are passed.

**Note that to delete the entire store you must pass `{force: true}`**

**Params**

* `keys` **{String|Array|Object}**: Keys to remove, or options.
* `options` **{Object}**

**Example**

```js
store.del();

// to delete paths outside cwd
store.del({force: true});
```

## Related

* [assign-value](https://github.com/jonschlinkert/assign-value): Extend a value or deeply nested property of an object using object path notation.
* [get-value](https://github.com/jonschlinkert/get-value): Use property paths (`  a.b.c`) to get a nested value from an object.
* [has-own-deep](https://github.com/jonschlinkert/has-own-deep): Returns true if an object has an own, nested property using dot notation paths ('a.b.c').
* [has-value](https://github.com/jonschlinkert/has-value): Returns true if a value exists, false if empty. Works with deeply nested values using… [more](https://github.com/jonschlinkert/has-value)
* [set-value](https://github.com/jonschlinkert/set-value): Create nested values and any intermediaries using dot notation (`'a.b.c'`) paths.
* [union-value](https://github.com/jonschlinkert/union-value): Set an array of unique values as the property of an object. Supports setting deeply… [more](https://github.com/jonschlinkert/union-value)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/data-store/issues/new)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Author

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on August 19, 2015._