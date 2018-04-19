// default cwd is `~/data-store/`
const Store = require('./');
const store = new Store('app', { cwd: 'test/actual' });

store.set('a', 'b');
store.set({ c: 'd' });
store.set('e.f', 'g')

console.log(store.get('e.f'));
//=> 'g'

console.log(store.get());
//=> { name: 'app', data: { a: 'b', c: 'd', e: { f: 'g' } } }

console.log(store.data);
//=> { a: 'b', c: 'd', e: { f: 'g' } }

console.log(store.keys)
