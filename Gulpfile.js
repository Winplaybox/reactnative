var gulp = require('gulp');
var watch = require('gulp-watch');
const debug = require('gulp-debug');

var source = './server_app',
    destination = './../heroku/zeal-server';

gulp.task('default', function (a) {
    gulp.src([source + "/**/*","!"+source + '/node_modules',"!"+source + '/node_modules/**/*',"!"+source + '/node_modules/**/**/*'], { base: source })
    .pipe(watch(source, {base: source}))
    .pipe(debug({title: 'changed'}))
    .pipe(gulp.dest(destination));
    a();
});