'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();

gulp.task('copy', function() {
  return gulp.src([
    '_resouce/**/*'
  ])
  .pipe(gulp.dest('html/'))
  .pipe(browserSync.stream());
});

gulp.task('default', function() {
  browserSync.init({
    server: {
      baseDir: "html"
    }
  });

  gulp.watch(['_resouce/**/*'], ['copy']);
});
