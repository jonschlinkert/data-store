const Store = require('..');
const store = new Store('app', { path: __dirname + '/debounce.json', debounce: 5 });

store.set('a', 'b');
store.set('c', 'd');
store.set('c', 'd');
store.set('c', 'd');
store.set('a', 'b');
store.set('c', 'd');
store.set('c', 'd');
store.set('c', 'd');
store.set('a', 'b');
store.set('c', 'd');
store.set('c', 'd');
store.set('c', 'd');

const int = setInterval(function() {
  console.log(store.data);
  console.log(store.unlink);
}, 9);

store.unlink();
setTimeout(() => {
  store.set('e', 'f');
  store.set('e', 'f');
  store.set('e', 'f');
  store.set('e', 'f');
  store.set('e', 'f');
  store.set('e', 'f');

  store.unlink();
  clearInterval(int);
}, 100);
