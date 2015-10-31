'use strict';

var gulp = require('gulp');

gulp.task('copy', function() {
  return gulp.src([
    '_resouce/**/*'
  ])
  .pipe(gulp.dest('html/'));
});
