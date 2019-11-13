const fs = require('fs');
const ini = require('ini');
const utils = require('../utils');
const path = require('path');
const Store = require('../');

// Will be called in context of store
function writeFile() {
  console.log('writeFile');
  utils.mkdir(path.dirname(this.path));
  fs.writeFileSync(this.path, ini.stringify(this.data), { mode: 0o0600 });
}

// Will be called in context of store
function readFile() {
  let data;

  console.log('readFile');
  try {
    data = fs.readFileSync(this.path, 'utf-8');
  } catch (e) {
    console.log('readFile error; starting with empty data');
    data = {};
  }

  // Parse the INI-format configuration file
  return ini.parse(data);
}

const store = new Store('app', {
  path: __dirname + '/data.ini',
  debounce: 10,
  writeFile,
  readFile
});

store.merge('section 1', { a : 'b' });
store.merge('section 1', { c : 'd' });
store.set('section 2', { e : 'f' });
console.log(store.data);

//store.unlink();
