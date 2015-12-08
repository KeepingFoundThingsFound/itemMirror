// The purpose of this file is to automate common tasks and improve the
// workflow for developers who use it. Gulp is the successor to grunt, and is
// typically much easier to use and maintain. Learn more here: http://gulpjs.com/

'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var eslint=  require('gulp-eslint');
var path = require('path');
var yuidoc = require('gulp-yuidoc')

const SCRIPTS = path.resolve('./scripts');
const JS = path.join(SCRIPTS, '*.js');

// Uses browserify to compile modules, and put rendered files in the dist
// directory. Uglify is then used to ugilfy the source and create source maps
gulp.task('build', function() {
  // set up the browserify instance on a task basis
  var b = browserify({
  entries: './scripts/ItemMirror.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('item-mirror.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('lint', function () {
  return gulp.src(path.join(SCRIPTS, '*.js'))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('document', function() {
  return gulp.src(JS)
    .pipe(yuidoc())
    .pipe(gulp.dest('./doc'));
});

gulp.task('develop', function() {
  gulp.watch(JS, ['lint', 'build']);
});