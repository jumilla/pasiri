
var gulp = require('gulp')
var webpack = require('webpack-stream');
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var run = require('run-sequence')

gulp.task('default', ['build'])

gulp.task('build', function (callback) {
	run('build-js', 'build-minify', callback)
})

gulp.task('build-js', function() {
	var entry = './lib/browser.js'
	return gulp.src(entry)
		.pipe(webpack({
			output: {
				filename: 'pasiri.js'
			},
		}))
		.pipe(gulp.dest('./dist'))
})

gulp.task('build-minify', function() {
	return gulp.src('./dist/pasiri.js')
		.pipe(uglify({}))
		.pipe(rename('pasiri.min.js'))
		.pipe(gulp.dest('./dist'))
})

