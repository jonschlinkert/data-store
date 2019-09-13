# Release history

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<details>
  <summary><strong>Guiding Principles</strong></summary>

- Changelogs are for humans, not machines.
- There should be an entry for every single version.
- The same types of changes should be grouped.
- Versions and sections should be linkable.
- The latest version comes first.
- The release date of each versions is displayed.
- Mention whether you follow Semantic Versioning.

</details>

<details>
  <summary><strong>Types of changes</strong></summary>

Changelog entries are classified using the following labels _(from [keep-a-changelog](http://keepachangelog.com/)_):

- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

</details>

## [4.0.0] - 2019-07-03

**Changed**

- the main export is now a function instead of a class, but this should not be a breaking change as you can still do `new` with any function. See [#19](https://github.com/jonschlinkert/data-store/issues/19)
- updated `mkdir` util to use native `fs.mkdir`, now that it supports recursion.

## [3.0.3] - 2017-05-22

- Improvements to debounce for `.save()`

**Deprecated**

- `.deleteFile()` will be removed in the next major release

## [3.0.2] - 2017-05-22

**Fixed**

- Merge pull request #13 from nytamin/master - adds typings, `EPERM` error handling for Windows

## [2.0.0] - 2018-05-01

**Added**

- Merge pull request #8 from jamen/master - use XDG directory

## [1.0.0] - 2017-05-22

- run update
- update deps, remove verbfile.js
- add example to readme
- allow `store.path` to be set directly

## [0.16.1] - 2016-07-11

- run update
- adds debug, minor edits
- use `verb-generate-readme`
- generate docs

## [0.16.0] - 2016-05-19

- expose sub-store data on property of parent store
- generate docs

## [0.15.5] - 2016-03-02

- allow dashes in sub-store names
- generate docs

## [0.15.4] - 2016-02-27

- fixes https://github.com/jonschlinkert/data-store/commit/a62b36aa7fc9a7215bb15ab5738dd79686eae25c#commitcomment-16372520, thanks to @tunnckoCore for point it out

## [0.15.3] - 2016-02-27

- simplify to use `this.name`
- generate docs

## [0.15.2] - 2016-02-27

- handle path differently, fix basename bug
- generate docs

## [0.15.1] - 2016-02-27

- fix keys getter, path bug
- generate docs

## [0.15.0] - 2016-02-27

- use `cache-base` lib instead of `base`, also adds `create` method
- adds verbfile.js
- update dependencies
- generate docs

## [0.14.0] - 2016-02-04

- only write data that was set through the API

## [0.13.0] - 2016-01-23

- use `base` lib
- clean up deps
- lint
- update deps, verb config

## [0.12.1] - 2016-01-02

- run `update`
- copyright date
- remove code that is already provided by base-methods
- update deps

## [0.12.0] - 2015-11-09

- use eslint
- lint
- update deps
- `get` now expects key to not be undefined
- clean up, save on set, update readme

## [0.11.1] - 2015-10-23

- adds events to `has` and `hasOwn`
- streamline tests, add test for `has` event
- update docs

## [0.11.0] - 2015-10-21

- make del sync
- update docs for 0.11.0

## [0.10.1] - 2015-10-19

- use `resolve-dir`
- rebuild docs

## [0.10.0] - 2015-10-14

- lint
- update lazy-cache signature
- adds gulp
- use base-methods
- adds coverage

## [0.9.0] - 2015-08-30

- move libs to utils
- adds static `extend` method
- adds 0.9.0 tests
- examples for 0.9.0
- build docs

## [0.8.2] - 2015-08-19

- add an indent option to pass to JSON.stringify
- save after union and del commands
- updating option comments and rebuilding readme
- Merge pull request #6 from jonschlinkert/indent-and-save
- update to latest lazy-cache

## [0.8.1] - 2015-08-01

- fix `.has` method
- add `.hasOwn` method
- Merge pull request #5 from chorks/hasown-method
- make it lazier

## [0.8.0] - 2015-07-05

- adds `union` method
- generate docs

## [0.6.0] - 2015-05-07

- breaking change: `delete` => `del`
- update metadata
- fix template
- generate docs

## [0.5.0] - 2015-04-19

- adds events
- events tests
- remove junk

## [0.4.1] - 2015-03-28

- persist store

## [0.4.0] - 2015-03-28

- adds travis badge
- lint
- adds example.js to editorconfig
- update example
- refactored
- update examples
- include example.js
- update tests

## [0.3.3] - 2015-02-09

- travis

## [0.3.2] - 2015-02-08

- rename license file
- remove junk
- build readme

## [0.3.1] - 2014-12-17

- Merge remote-tracking branch 'origin/prev'
- lint

## [0.3.0] - 2014-12-17

- fix readme
- adds npmignore
- adds example, tests
- update dotfiles
- remove extra heading in readme
- update ignore patterns
- fix examples
- update ignore patterns
- adds `extists` and `delete` methods
- build readme

## [0.2.0] - 2014-11-15

- first commit
- remove console.log
- remove old fixtures
- update verb and dotfiles
- refactor
- run verb

[2.0.0]: https://github.com/jonschlinkert/data-store/compare/0.2.0...HEAD
[1.0.0]: https://github.com/jonschlinkert/data-store/compare/0.16.1...1.0.0
[0.16.1]: https://github.com/jonschlinkert/data-store/compare/0.16.0...0.16.1
[0.16.0]: https://github.com/jonschlinkert/data-store/compare/0.15.5...0.16.0
[0.15.5]: https://github.com/jonschlinkert/data-store/compare/0.15.4...0.15.5
[0.15.4]: https://github.com/jonschlinkert/data-store/compare/0.15.3...0.15.4
[0.15.3]: https://github.com/jonschlinkert/data-store/compare/0.15.2...0.15.3
[0.15.2]: https://github.com/jonschlinkert/data-store/compare/0.15.1...0.15.2
[0.15.1]: https://github.com/jonschlinkert/data-store/compare/0.15.0...0.15.1
[0.15.0]: https://github.com/jonschlinkert/data-store/compare/0.14.0...0.15.0
[0.14.0]: https://github.com/jonschlinkert/data-store/compare/0.13.0...0.14.0
[0.13.0]: https://github.com/jonschlinkert/data-store/compare/0.12.1...0.13.0
[0.12.1]: https://github.com/jonschlinkert/data-store/compare/0.12.0...0.12.1
[0.12.0]: https://github.com/jonschlinkert/data-store/compare/0.11.1...0.12.0
[0.11.1]: https://github.com/jonschlinkert/data-store/compare/0.11.0...0.11.1
[0.11.0]: https://github.com/jonschlinkert/data-store/compare/0.10.1...0.11.0
[0.10.1]: https://github.com/jonschlinkert/data-store/compare/0.10.0...0.10.1
[0.10.0]: https://github.com/jonschlinkert/data-store/compare/0.9.0...0.10.0
[0.9.0]: https://github.com/jonschlinkert/data-store/compare/0.8.2...0.9.0
[0.8.2]: https://github.com/jonschlinkert/data-store/compare/0.8.1...0.8.2
[0.8.1]: https://github.com/jonschlinkert/data-store/compare/0.8.0...0.8.1
[0.8.0]: https://github.com/jonschlinkert/data-store/compare/0.6.1...0.8.0
[0.6.1]: https://github.com/jonschlinkert/data-store/compare/0.6.0...0.6.1
[0.6.0]: https://github.com/jonschlinkert/data-store/compare/0.5.0...0.6.0
[0.5.0]: https://github.com/jonschlinkert/data-store/compare/0.4.1...0.5.0
[0.4.1]: https://github.com/jonschlinkert/data-store/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/jonschlinkert/data-store/compare/0.3.3...0.4.0
[0.3.3]: https://github.com/jonschlinkert/data-store/compare/0.3.2...0.3.3
[0.3.2]: https://github.com/jonschlinkert/data-store/compare/0.3.1...0.3.2
[0.3.1]: https://github.com/jonschlinkert/data-store/compare/0.3.0...0.3.1
[0.3.0]: https://github.com/jonschlinkert/data-store/compare/0.2.0...0.3.0

[keep-a-changelog]: https://github.com/olivierlacan/keep-a-changelog