const Store = require('../');
const store = new Store('app', { path: __dirname + '/data.json', debounce: 10 });

store.set('a', 'b');
store.set({ c: 'd' });
store.set('e.f.g', 'zzz');

console.log(store.get('e.f'));
//=> { g: 'zzz' }

console.log(store.data);
//=> { a: 'b', c: 'd', e: { f: { g: 'zzz' } } }

store.clear();
console.log(store.data);
//=> {}

store.unlink();
