const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const minifycss = require('gulp-minify-css');

gulp.task('sass', function() {
    gulp.src('app/sass/ibootstrap.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(minifycss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch', function() {
    gulp.watch('dist/sass/**/*.scss', ['sass']);
});

gulp.task('default', ['sass']);
