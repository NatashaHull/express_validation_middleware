const gulp = require('gulp');
const runSequence = require('run-sequence');
const {jasmine} = require('gulp-load-plugins')();

gulp.task('spec', done => runSequence('lint', 'spec-unit', done));


gulp.task('spec-unit', () => {
  return gulp.src('spec/**/*_spec.js')
    .pipe(jasmine({includeStackTrace: true}));
});