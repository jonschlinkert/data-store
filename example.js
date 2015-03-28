var Store = require('./');
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