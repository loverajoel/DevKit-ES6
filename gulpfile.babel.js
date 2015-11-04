'use strict';

const gulp = require('gulp');
const Bundlerify = require('gulp-bundlerify').default;
const fs = require('fs');

const bundler = new Bundlerify(gulp, {
    mainFile: './demo/index.js',
    watchifyOptions: {
        fullPaths: false,
    },
    browserSyncOptions: {
        server: {
            baseDir: './demo/',
            directory: false,
        },
    },
    esdocOptions: JSON.parse(fs.readFileSync('esdoc.json', 'utf8')),
    tasks: {
        build: {
            method: (task) => {
                gulp.src(['./src/**/*']).pipe(gulp.dest('./dist'));
                bundler.config.polyfillsEnabled = true;
                bundler.config.uglify = true;
                return task();
            },
        },
    },
}).tasks();
