var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var watch = require('gulp-watch')
var batch = require('gulp-batch')
var sass = require('gulp-sass')

gulp.task('default', function() {
	return gulp.src('public_dev/**/*.js')
		.pipe(concat('min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('public/app/'))
})

gulp.task('sass', function () {
  return gulp.src('public_dev/**/*.scss')
  	.pipe(concat('styles.css'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('public/'));
});

gulp.task('copy', function(){
	return gulp.src('public_dev/**/*.html')
	.pipe(gulp.dest('public/'))
})

gulp.task('watch', function () {
	watch('public_dev/**/*.js', batch(function (events, done) {
		gulp.start('default', done)
	}))
	watch('public_dev/**/*.scss', batch(function (events, done) {
		gulp.start('sass', done)
	}))
	watch('public_dev/**/*.html', batch(function(events, done) {
		gulp.start('copy', done)
	}))
})