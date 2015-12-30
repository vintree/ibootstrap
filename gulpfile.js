const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');


gulp.task('es6', () => {
    return gulp.src('gapp/js/jsx/**/*.js')
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest('gapp/js/app'));
});

gulp.task('sass',  () => {
    gulp.src('gapp/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./gapp/css'));
});

gulp.task('watch', () => {
    gulp.watch('gapp/js/jsx/index.js', ['es6']);
    gulp.watch('gapp/sass/**/*.scss', ['sass']);
});

gulp.task('default', ['es6', 'sass']);
