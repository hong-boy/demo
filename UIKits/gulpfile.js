'use strict';
const gulp = require('gulp');
const less = require('gulp-less');
const clean = require('gulp-clean');
const watch = require('gulp-watch');

gulp.task('less', function () {
    watch('src/**/*.less', function () {
        gulp.src('src/**/*.less')
            .pipe(less())
            .pipe(gulp.dest('./src'));
    })
});