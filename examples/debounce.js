// default cwd is `~/data-store/`

(async function(argument) {

const Store = require('../');
const store = new Store('app', { path: __dirname + '/debounce.json', delay: 10 });
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
  store.unlink();
  console.log(store.data);
  console.log(store);

  return new Promise(resolve => {
    setTimeout(() => {
      store.set('e', 'f');
      store.set('e', 'f');
      store.set('e', 'f');
      store.set('e', 'f');
      store.set('e', 'f');
      store.set('e', 'f');
      console.log(store.data);
      store.unlink();
      resolve();
    }, 200);
  });
})();
