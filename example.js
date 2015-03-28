var Store = require('./');
var store = new Store('app', {cwd: 'actual'});

store
  .set('a', 'b')
  .set('c', 'd')
  .set('e', 'f');

store.save();

console.log(store.get());
store.omit('a');

console.log(store.get());
store.delete();

console.log(store.get());