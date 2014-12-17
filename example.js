'use strict';

var Store = require('./');
var store = new Store('app');

store
  .set('a', 'b')
  .set('c', 'd')
  .set('e', 'f');

store.save('actual/app.json');

console.log(store.get());
store.delete();