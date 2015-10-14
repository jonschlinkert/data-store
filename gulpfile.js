'use strict';

var gulp = require('gulp');
var stylish = require('jshint-stylish');
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

var lint = ['index.js', 'utils.js'];

gulp.task('lint', function () {
  return gulp.src(lint.concat(lint))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('coverage', function () {
  return gulp.src(lint)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['coverage'], function () {
  return gulp.src('test.js')
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports())
    .pipe(istanbul.writeReports({
      reporters: [ 'text' ],
      reportOpts: {dir: 'coverage', file: 'summary.txt'}
    }));
});

gulp.task('default', ['test', 'lint']);
