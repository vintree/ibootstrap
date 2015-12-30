const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');


gulp.task('es6', function() {
    return gulp.src('gapp/js/jsx/**/*.js')
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest('gapp/js/mjs'));
});

gulp.task('sass', function() {
    gulp.src('gapp/sass/ibootstrap.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./gapp/css'));
});

gulp.task('watch', function() {
    gulp.watch('gapp/js/jsx/index.js', ['es6']);
    gulp.watch('gapp/sass/**/*.scss', ['sass']);
});

gulp.task('default', ['es6', 'sass']);
