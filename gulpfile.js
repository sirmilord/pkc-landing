'use strict';

const gulp = require('gulp'),
    sass = require('gulp-sass'),
    cleancss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    autoprefixer = require('autoprefixer'),
    replace = require('gulp-replace'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    gulpIf = require('gulp-if'),
    debug = require('gulp-debug'),
    postcss = require('gulp-postcss'),
    csscomb = require('gulp-csscomb'),
    fileinclude = require('gulp-file-include'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    newer = require('gulp-newer'),
    del = require('del'),
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    svgfallback = require('gulp-svgfallback'),
    lessToScss = require('gulp-less-to-scss'),
    size = require('gulp-size'),
    mqpacker = require('css-mqpacker'),
    uglify = require('gulp-uglify');

// Запуск `NODE_ENV=production npm start [задача]` приведет к сборке без sourcemaps
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV == 'dev';


//SASS comb
gulp.task('comb', function () {
    console.log('---------- SASS combing');
    return gulp.src('./src/**/*.scss', {since: gulp.lastRun('comb')}) // only  files were change
        .pipe(csscomb())
        .pipe(debug({title: "cssComb:"}))
        .pipe(gulp.dest('./src/'))
        .pipe(debug({title: "scss combed:"}));
});

//LESS2SASS
gulp.task('lessToScss', function () {
    return gulp.src('./src/blocks/to-top/*.less') //TODO change it
        .pipe(lessToScss())
        .pipe(gulp.dest('./src/blocks/to-top/')); //TODO change it
});

//Styleint
gulp.task('lint-css', function lintCssTask() {
    const gulpStylelint = require('gulp-stylelint');

    return gulp
        .src('src/scss/*.*')
        .pipe(gulpStylelint({
            failAfterError: false,
            reportOutputDir: 'reports/lint',
            reporters: [
                {formatter: 'verbose', console: true},
                {formatter: 'json', save: 'report.json'},
            ]
        }));
});

//  SCSS compilation
gulp.task('css', function () {
    console.log('---------- SASS compile');
    return gulp.src('./src/scss/style.scss')
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(debug({title: "SCSS:"}))
        .pipe(sass())
        .on('error', notify.onError(function(err){
            return {
                title: 'Styles compilation error',
                message: err.message
            }
        }))
        .pipe(postcss([
            autoprefixer(),
            mqpacker({
                sort: true
            }),
        ]))
        .pipe(gulpIf(!isDev, cleancss()))
        .pipe(rename('style.min.css'))
        .pipe(debug({title: "RENAME:"}))
        .pipe(gulpIf(isDev, sourcemaps.write('/')))
        .pipe(size({
            title: 'size',
            showFiles: true,
            showTotal: false,
        }))
        .pipe(gulp.dest('./build/css/'));
});

//copy additional CSS
gulp.task('copy:css', function(callback) {
        console.log('---------- copy CSS');
        return gulp.src('./src/css/*.css', {since: gulp.lastRun('copy:css')})
            .pipe(postcss([
                autoprefixer(),
                mqpacker({
                    sort: true
                }),
            ]))
            .pipe(cleancss())
            .pipe(gulp.dest('./build/css/'))
});

// coping and optimisation images
gulp.task('img', function () {
    // console.log('---------- Copy and optimisation images');
    return gulp.src('./src/img/*.{jpg,jpeg,gif,png,svg}', {since: gulp.lastRun('img')}) // only new files are change
        .pipe(newer('./build/img/'))  // keep only new files
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./build/img'))
        .pipe(debug({title: "img:"}));
});

//  SVG-inline-sprite compilation
gulp.task('svg-inline', function () {
    console.log('---------- SVG-sprite compilation');
    return gulp.src('./src/img/*.svg')
        .pipe(svgmin(function (file) {
            return {
                plugins: [{
                    cleanupIDs: {
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore({inlineSvg: true}))
        .pipe(cheerio(function ($) {
             $('svg').attr('style', 'display:none');
        }))
        .pipe(rename('sprite-svg--ls.svg'))
        .pipe(gulp.dest('./build/img/'))
        .pipe(debug({title: "SVG-sprite:"}));
});

 //SVG-sprite compilation
gulp.task('svg-sprite', function () {
    console.log('---------- SVG-sprite compilation');
    return gulp.src('./src/img/*.svg')
        .pipe(svgmin(function (file) {
            return {
                plugins: [{
                    cleanupIDs: {
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore({inlineSvg: true}))
        .pipe(cheerio(function ($) {
            $('[fill]').removeAttr('fill');
            $('[stroke]').removeAttr('stroke');
            $('[style]').removeAttr('style');
        }))
        .pipe(rename('sprite.svg'))
        .pipe(gulp.dest('./build/img/'))
        .pipe(debug({title: "SVG-sprite:"}));
});

// concatenate and uglify JS
gulp.task('js', function () {
        console.log('---------- JS processing');
        return gulp.src('./src/**/*.js')
            .pipe(gulpIf(isDev, sourcemaps.init()))
            .pipe(concat('script.min.js'))
            //.pipe(gulpIf(!isDev, uglify()))
            .on('error', notify.onError(function(err){
                return {
                    title: 'Javascript uglify error',
                    message: err.message
                }
            }))
            .pipe(gulpIf(isDev, sourcemaps.write('.')))
            .pipe(size({
                title: 'size',
                showFiles: true,
                showTotal: false,
            }))
            .pipe(gulp.dest('./build/js/'));
});

// Compile SVG fallback sprite
gulp.task('svgfallback', function () {
    console.log('---------- Compile SVG fall back sprite');
    return gulp
        .src('./src/img/*.svg')
        .pipe(svgfallback())
        .pipe(gulp.dest('./build/test/'))
        .pipe(debug({title: "SVG fall back sprite:"}));
});

//Coping font files
gulp.task('font', function () {
    console.log('---------- Coping font files');
    return gulp.src('./src/fonts/*', {since: gulp.lastRun('font')})
        .pipe(gulp.dest('./build/fonts/'))
        .pipe(debug({title: "font:"}));
});

//Assembly html files
gulp.task('html', function () {
    console.log('---------- Assembly html files');
    return gulp.src('./src/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
        .pipe(gulp.dest('./build/'));
});

//tracking for changes
gulp.task('watch', function () {
    gulp.watch('./src/scss/**/*.scss', gulp.series('css'));
    gulp.watch('./src/blocks/**/**/*.scss', gulp.series('css'));
    gulp.watch('./src/css/*.css', gulp.series('copy:css'));
    gulp.watch('./src/**/**/*.html', gulp.series('html'));
    gulp.watch('./src/**/*.js', gulp.series('js'));
    gulp.watch('./src/img/*.{jpg,jpeg,gif,png,svg}', gulp.series('img'));
    gulp.watch('./src/font/*.*', gulp.series('font'));
});

//browser synchronisation
gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: "./build/",
            startPath: "index.html"
        }
    });
    browserSync.watch('./build/css/*.css').on('change', browserSync.reload);
    browserSync.watch('./build/js/*.js').on('change', browserSync.reload);
    browserSync.watch('./build/img/*.*').on('change', browserSync.reload);
    browserSync.watch('./build/*.html').on('change', browserSync.reload);
    browserSync.watch('./build/fonts/*.*').on('change', browserSync.reload);
});

// cleaning of build folder
gulp.task('clean', function () {
    console.log('---------- cleaning of build folder');
    return del([
        './build/**/*.*',
        '!' + './build/readme.md'
    ]);
});

//build task - run all producing tasks
gulp.task('build',
    // gulp.series( gulp.parallel('css', 'copy:css', 'img', 'html', 'js', 'svg-sprite', 'font'))
    gulp.series( gulp.parallel('css', 'copy:css', 'img', 'html', 'js', 'font'))
);

//default task - auto running on Storm start
gulp.task('default',
    gulp.series(/*'comb', gulp.parallel('css', 'img', 'html', 'js'),*/ gulp.parallel('watch', 'serve'))
);

