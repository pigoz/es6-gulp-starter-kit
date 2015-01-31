var gulp       = require('gulp')
 ,  sass       = require('gulp-sass')
 ,  csso       = require('gulp-csso')
 ,  jade       = require('gulp-jade')
 ,  notify     = require('gulp-notify')
 ,  sourcemaps = require('gulp-sourcemaps')
 ,  uglify     = require('gulp-uglify')
 ,  to5        = require('gulp-6to5')
 ,  http       = require('http')
 ,  ecstatic   = require('ecstatic')
 ,  source     = require('vinyl-source-stream')
 ,  buffer     = require('vinyl-buffer')
 ,  browserify = require('browserify')
 ,  c = {
      dist: { css: './dist/css', js: './dist/js', root: './dist'},
      watch: {css: './src/css/*.scss', js: './src/js/*.js'},
      css: './src/css/main.scss',
      js: './src/js/app.js',
      html: './src/**/*.jade',
      // fuck bower, let's use npm for bootstrap
      cssPaths: [ './node_modules/bootstrap-sass/assets/stylesheets/' ],
      serverPort: 1337,
    };

gulp.task('html', function() {
  return gulp
    .src(c.html)
    .pipe(jade({locals: {}}))
    .pipe(gulp.dest(c.dist.root))
});

gulp.task('js', function() {
  var bundler = browserify({ entries: [c.js], debug: true });
  var bundle = function() {
    return bundler
      .bundle()
      .pipe(source('app.min.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(to5())
        .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(c.dist.js));
  };

  return bundle();
});

gulp.task('css', function() {
  return gulp
    .src(c.css)
    .pipe(sourcemaps.init())
      .pipe(sass({errLogToConsole: true, includePaths: c.cssPaths }))
      .on('error', notify.onError())
      .pipe(csso())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(c.dist.css))
})

gulp.task('watch', function() {
  gulp.watch(c.watch.css, ['css'])
  gulp.watch(c.watch.js,  ['js'])
  gulp.watch(c.html,      ['html'])
})

gulp.task('server', function() {
  return http
    .createServer(ecstatic({root: c.dist.root}))
    .listen(c.serverPort)
});

gulp.task('build',   ['css',  'js', 'html'])
gulp.task('default', ['build', 'watch', 'server'])
