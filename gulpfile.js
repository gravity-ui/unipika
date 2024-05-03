'use strict';

const browserify = require('browserify');
const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const sass = require('gulp-dart-sass');
const derequire = require('gulp-derequire');
const source = require('vinyl-source-stream');

const DIST = './dist/';
const LIB = './lib/';
const STYLES = './styles/';
const EXAMPLE_DIST = './example/dist/';

gulp.task('bundle-scripts', () => {
    return browserify(LIB + 'unipika.js')
        .bundle()
        .pipe(source('unipika.js'))
        .pipe(derequire())
        .pipe(gulp.dest(DIST));
});

// Stylus + Autoprefixer
gulp.task('bundle-styles', () => {
    return gulp
        .src(STYLES + 'unipika.scss')
        .pipe(sass())
        .pipe(prefix(['last 2 version']))
        .pipe(gulp.dest(DIST));
});

gulp.task('bundle-example', () => {
    return browserify('./example/example.js')
        .bundle()
        .pipe(source('example-bundle.js'))
        .pipe(gulp.dest(EXAMPLE_DIST));
});

// Stylus + Autoprefixer
gulp.task('bundle-example-styles', () => {
    return gulp
        .src('./example/example.scss')
        .pipe(sass())
        .pipe(prefix(['last 2 version']))
        .pipe(gulp.dest(EXAMPLE_DIST));
});

gulp.task('dist', gulp.series('bundle-scripts', 'bundle-styles'));
gulp.task('example', gulp.series('bundle-example', 'bundle-example-styles'));

gulp.task('default', gulp.series('dist', 'example'));
