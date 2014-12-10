'use strict';

var Store = require('./async');
var store = new Store('app');

store
  .set('a', 'b')
  .set('c', 'd')
  .set('e', 'f');

store.save('app.json');

console.log(store.get());
store.delete();