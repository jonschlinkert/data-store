// default cwd is `~/data-store/`
var store = require('./')('app', {cwd: 'actual'});

store
  .set('a', 'b')
  .set({c: 'd'})
  .set('e.f', 'g')

console.log(store.get('e.f'));
//=> 'g'

console.log(store.get());
//=> {name: 'app', data: {a: 'b', c: 'd', e: {f: 'g' }}}

console.log(store.data);
//=> {a: 'b', c: 'd', e: {f: 'g'}}
