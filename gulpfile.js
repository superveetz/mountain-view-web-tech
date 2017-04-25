 // this file contains task runners for dev ops
'use strict';

var gulp          = require('gulp');
var gutil         = require('gulp-util');
var rename        = require('gulp-rename');
var runSequence   = require('run-sequence');
var sass          = require('gulp-sass');
var minifyCSS     = require('gulp-clean-css');
var concat        = require('gulp-concat');
var minify        = require('gulp-minify');
var babel         = require('gulp-babel');
var uglify        = require('gulp-minify');
var htmlmin       = require('gulp-htmlmin');
var imagemin      = require('gulp-imagemin');
var font2css      = require('gulp-font2css')

/*
 * WATCHES
 */
gulp.task('sass:watch', function () {
  // transpile sass to css
  var task1 = gulp.watch('./client/src/sass/**/*.scss', ['sass']);
  var task2 = gulp.watch('./client/src/css/transpiled/**/*.css', ['concat-app-css']);

  return [task1, task2];
});

/*
 * CSS
 */
gulp.task('sass', function () {
  // transpile sass to css
  return gulp.src('./client/src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./client/src/css/transpiled'));
});

gulp.task('concat-vendor-css', function () {
  // concat into 1 css file
  gulp.src([
    './client/src/bower_components/bootstrap/dist/css/bootstrap.min.css',
    './client/src/bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
    './client/src/bower_components/jasny-bootstrap/dist/css/jasny-bootstrap.min.css',
    './client/src/bower_components/font-awesome/css/font-awesome.min.css',
    './client/src/bower_components/animate.css/animate.min.css',
    './client/src/css/themes/stylish-portfolio.css',
    './client/src/css/themes/modern-business.css'
  ])
  .pipe(concat("vendors.min.css"))
  .pipe(gulp.dest('./client/dist/css/'));
});

gulp.task('concat-app-css', function () {
  // concat into 1 css file
  var appCSS = gulp.src('./client/src/css/transpiled/**/*.css')
                  .pipe(concat("styles.css"));
    
  var task1 = appCSS.pipe(gulp.dest('./client/src/css/'));
  var task2 = appCSS.pipe(gulp.dest('./client/dist/css/'));
  var task3 = gulp.src('./client/src/css/fonts.css')
              .pipe(gulp.dest('./client/dist/css/'));
  
  return [task1, task2, task3];
});

gulp.task('minify-app-css', function () {
  // minify css
  var task1 = gulp.src('./client/dist/css/styles.css')
    .pipe(minifyCSS({compatibility: 'ie8'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./client/dist/css/'));

  // minify fonts
  var task2 = gulp.src('./client/dist/css/fonts.css')
    .pipe(minifyCSS({compatibility: 'ie8'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./client/dist/css/'));

    return [task1, task2];
});

gulp.task('concat-vendors+app-css', function () {
  // concat into 1 css file
  return gulp.src([
    './client/dist/css/fonts.min.css',
    './client/dist/css/styles.min.css',
    './client/dist/css/vendors.min.css'
  ])
  .pipe(concat("vendors+styles.min.css"))
  .pipe(gulp.dest('./client/dist/css/'));
});

/*
 * JS
 */
gulp.task('concat-vendor-js', function () {
  return gulp.src([
    // vanilla vendor 
    './client/src/bower_components/firebase/firebase.js',
    './client/src/bower_components/jquery/dist/jquery.min.js',
    './client/src/bower_components/bootstrap/dist/js/bootstrap.min.js',
    './client/src/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
    './client/src/bower_components/async/dist/async.min.js',
    // angular vendor
    './client/src/bower_components/angular/angular.min.js',
    './client/src/bower_components/angular-ui-router/release/angular-ui-router.min.js',
    './client/src/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    './client/src/bower_components/angular-animate/angular-animate.min.js',
    './client/src/bower_components/angular-ui-validate/dist/validate.min.js',
    './client/src/bower_components/angularfire/dist/angularfire.min.js',
    './client/src/bower_components/ngSmoothScroll/dist/angular-smooth-scroll.min.js'
  ])
  .pipe(concat('vendors.min.js'))
  .pipe(gulp.dest('./client/dist/js/'));
});

gulp.task('concat-app-js', function () {
  return gulp.src([
    './client/src/app.js',
    './client/src/js/**/*.js'
  ])
  .pipe(babel({
      presets: ['es2015']
  }))
  .pipe(concat('app.js'))
  .pipe(gulp.dest('./client/dist/js/'));
});

gulp.task('minify-app-js', function () {
  return gulp.src('./client/dist/js/app.js')
  .pipe(minify({
    ext: {
      min: '.min.js'
    },
    noSource: true
  }))
  .pipe(gulp.dest('./client/dist/js/'));
});

gulp.task('concat-vendors+app-js', function () {
  return gulp.src([
    './client/dist/js/vendors.min.js',
    './client/dist/js/app.min.js'
  ])
  .pipe(concat('vendors+app.min.js'))
  .pipe(gulp.dest('./client/dist/'));
});

gulp.task('minify-html', function () {
  return gulp.src([
    './client/src/**/*.html',
    '!./client/src/themes/**/*.html',
    '!./client/src/bower_components/**/*.html'
  ])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./client/dist/'));
});

gulp.task('optimize-images', function() {
    return gulp.src([
      './client/src/**/*.png',
      './client/src/**/*.jpg',
      './client/src/**/*.gif',
      './client/src/**/*.jpeg',
      '!./client/src/bower_components/**/*'
    ])
    .pipe(imagemin())
    .pipe(gulp.dest('./client/dist/'));
});

gulp.task('copy-fonts-to-dist', function() {
    return gulp.src([
      './client/src/bower_components/font-awesome/fonts/**/*',
      './client/src/bower_components/bootstrap/dist/fonts/**/*',
      './client/src/fonts/**/*.{otf,ttf,woff,woff2}'
    ])
    .pipe(gulp.dest('./client/dist/fonts/'))
});

gulp.task('default', function (fnCb) {
  runSequence(
    'sass', 
    'copy-fonts-to-dist',
    'concat-vendor-css',
    'concat-app-css',
    'minify-app-css',
    'concat-vendors+app-css',
    'concat-vendor-js',
    'concat-app-js',
    'minify-app-js',
    'concat-vendors+app-js',
    'minify-html',
    'optimize-images',
    fnCb);
});