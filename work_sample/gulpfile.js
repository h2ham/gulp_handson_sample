'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var cp = require('child_process');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ff > 5%',
  'Chrome > 5%',
  'Safari > 5%',
  'iOS >= 7',
  'Android >= 4'
];

var config = {
  dev: true
}

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src([
      '_resource/**/*.js',
      '!_resource/js/vendor/*'
    ])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

gulp.task('scripts', ['jshint'], function () {
  return gulp.src([
      '_resource/js/vendor/jquery.js',
      '_resource/js/functions.js'
    ])
    .pipe($.plumber())
    .pipe($.concat('app.js'))
    .pipe($.if(!config.dev, $.uglify({preserveComments: 'some'})))
    .pipe(gulp.dest('html/js'))
    .pipe($.size({title: 'scripts'}))
    .pipe($.if(config.dev, browserSync.stream()));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src(['_resource/**/*.{jpg,gif,png}'])
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('html'))
    .pipe($.size({title: 'images'}));
});

gulp.task('styles', function () {
  return gulp.src([
      '_resource/**/*.scss'
    ])
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.if('*.css', $.csscomb()))
    .pipe($.if(!config.dev, $.if('*.css', $.minifyCss())))
    .pipe(gulp.dest('html'))
    .pipe($.size({title: 'css'}))
    .pipe($.if(config.dev, browserSync.stream()));
});

gulp.task('metalsmith-build', function (done) {
  return cp.spawn('npm', ['run','metalsmith'], {stdio: 'inherit'})
    .on('close', done);
});

gulp.task('html', ['metalsmith-build'], function () {
  return gulp.src(['.tmphtml/**/*.html'])
    .pipe(gulp.dest('html'))
    .pipe($.size({title: 'html'}))
    .pipe($.if(config.dev, browserSync.stream()));
});

gulp.task('clean', function (cb) {
  del.bind(null, ['html']);
  return $.cache.clearAll(cb);
});

gulp.task('server', ['clean', 'html', 'styles', 'scripts', 'images'], function () {
   browserSync.init({
    server: {
      baseDir: "html"
    }
  });

  gulp.watch(['_resource/**/*.html'], ['html']);
  gulp.watch(['_resource/**/*.'], ['styles:dev']);
  gulp.watch(['_resource/**/*.js'], ['scripts']);
  gulp.watch(['_resource/**/*.{jpg,gif,png}'], ['images', browserSync.reload]);
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  config.dev = false; // use gulp-util
  runSequence('styles', ['html', 'scripts', 'images'], cb);
});
