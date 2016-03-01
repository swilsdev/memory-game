var gulp = require('gulp'),
  livereload = require('gulp-livereload'),
  nodemon = require('nodemon');

gulp.task('start', function() {
  livereload.listen();
  nodemon({
    script: 'server.js',
    ext: 'js html css',
    env: {
      'NODE_ENV': 'development'
    }
  }).on('start', function() {
    console.log('started');
    livereload.reload();
  })
})
