'use strict';

const gulp = require('gulp');
const browserify = require('browserify');
const sass = require('gulp-sass');
const prefix = require('gulp-autoprefixer');
const source = require('vinyl-source-stream');
const derequire = require('gulp-derequire');

const DIST = './dist/';
const LIB = './lib/';
const STYLES = './styles/';
const EXAMPLE_DIST = './example/dist/';
const TEST_DIST = './test/dist/';

gulp.task('bundle-scripts', () => {
    return browserify(LIB + 'unipika.js')
        .bundle()
        .pipe(source('unipika.js'))
        .pipe(derequire())
        .pipe(gulp.dest(DIST));
});

// Stylus + Autoprefixer
gulp.task('bundle-styles', () => {
    return gulp.src(STYLES + 'unipika.scss')
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
    return gulp.src('./example/example.scss')
        .pipe(sass())
        .pipe(prefix(['last 2 version']))
        .pipe(gulp.dest(EXAMPLE_DIST));
});

gulp.task('bundle-test-environment', () => {
    return browserify('./test/environment.js')
        .bundle()
        .pipe(source('environment-bundle.js'))
        .pipe(gulp.dest(TEST_DIST));
});

gulp.task('dist', gulp.series('bundle-scripts', 'bundle-styles'));
gulp.task('example', gulp.series('bundle-example', 'bundle-example-styles'));
gulp.task('test', gulp.series('bundle-test-environment'));

gulp.task('default', gulp.series('dist', 'example', 'test'));
