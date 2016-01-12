const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const minifycss = require('gulp-minify-css');

// gulp.task('es6', function() {
//     return gulp.src(['app/js/lib/common.js', 'app/js/lib/ibootstrap.js'])
//     .pipe(babel( { presets: ['es2015'] } ) )
//     .pipe(concat('ibootstrap.js'))
//     .pipe(uglify())
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(gulp.dest('dist/js/'));
// });
//
// gulp.task('add', function() {
//     return gulp.pipe(['app/js/lib/common.js', 'app/js/lib/ibootstrap.js'])
//     .pipe(concat('ibootstrap.js'))
//     .pipe(gulp.dest('dist/js/'));
// })

gulp.task('sass', function() {
    gulp.src('app/sass/ibootstrap.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(minifycss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/css'));
});

// 清空图片、样式、js
// gulp.task('clean', function() {
//     gulp.src(['./dist/css', './dist/js'], {read: false})
//         .pipe(clean());
// });

gulp.task('watch', function() {
    // gulp.watch('dist/js/jsx/index.js', ['es6']);
    gulp.watch('dist/sass/**/*.scss', ['sass']);
});

gulp.task('default', ['sass']);
