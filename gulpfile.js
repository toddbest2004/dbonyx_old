var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var watch = require('gulp-watch')
var batch = require('gulp-batch')

gulp.task('default', function() {
	return gulp.src('public_dev/**/*.js')
		.pipe(concat('min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('public/app/'))
})

gulp.task('watch', function () {
	watch('public_dev/**/*.js', batch(function (events, done) {
		gulp.start('default', done)
	}))
})