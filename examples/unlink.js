const fs = require('fs');
const Store = require('..');
const store = new Store('app', { path: __dirname + '/basic.json', debounce: false });

store.set('a', 'b');
store.set({ c: 'd' });
store.set('e.f.g', 'zzz');

console.log(store.get('e.f'));
//=> { g: 'zzz' }

console.log(store.data);
//=> { a: 'b', c: 'd', e: { f: { g: 'zzz' } } }

console.log(store.clear());
console.log(store.data);
//=> {}

console.log(fs.existsSync(store.path));

setTimeout(() => {
  store.unlink();
  console.log(fs.existsSync(store.path));

  setTimeout(() => {
    console.log(fs.existsSync(store.path));
  }, store.delay + 5);
}, store.delay + 5);
