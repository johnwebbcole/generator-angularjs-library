var gulp = require('gulp');
var fs = require('fs');
var Server = require('karma').Server;
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var path = require('canonical-path');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');
var eslint = require('gulp-eslint');
var ngAnnotate = require('gulp-ng-annotate');
var bump = require('gulp-bump');
var git = require('gulp-git');
var Dgeni = require('dgeni');

/**
 * File patterns
 **/

// Root directory
var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src');

// tests
var testDirectory = path.join(rootDirectory, './test/unit');

var sourceFiles = [

  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),

  // Then add all JavaScript files
  path.join(sourceDirectory, '/**/*.js')
];

var lintFiles = [
  'gulpfile.js',
  // Karma configuration
  'karma-*.conf.js'
].concat(sourceFiles);

gulp.task('build', function () {
  gulp.src(sourceFiles)
    .pipe(plumber())
    .pipe(concat('<%= config.libraryName.dasherized %>.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename('<%= config.libraryName.dasherized %>.min.js'))
    .pipe(gulp.dest('./dist'));
});

/**
 * Process
 */
gulp.task('process-all', function (done) {
  runSequence('eslint', 'test', 'build', done);
});

/**
 * Watch task
 */
gulp.task('watch', function () {

  // Watch JavaScript files
  gulp.watch(sourceFiles, ['process-all']);

  // watch test files and re-run unit tests when changed
  gulp.watch(path.join(testDirectory, '/**/*.js'), ['test']);
});


/**
 * Validate source with eslint
 */
gulp.task('eslint', function () {
  return gulp.src(lintFiles)
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  var files = {
    src: [
      'src/**/*.module.js',
      'src/**/*.js'],
    concatenated: [
      'dist/<%= config.libraryName.dasherized %>.js'
    ],
    minified: [
      'dist/<%= config.libraryName.dasherized %>.min.js'
    ]
  };

  var arg = process.argv[3] ? process.argv[3].substr(2) : 'src';
  var testfiles = files[arg];
  if (!testfiles) {
    console.error('Wrong parameter [%s], availables : --src, --concatenated, --minified', arg); // eslint-disable-line no-console
    return done(true);
  }

  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    files: require('main-bower-files')({
      checkExistence: true,
      includeDev: false,
      debugging: false,
      filter: ['**/*.js', '**/*.css']
    }).concat([
      'bower/angular-mocks/angular-mocks.js'],
      testfiles, ['test/unit/**/*.js'])
  }, done).start();
});

gulp.task('version', function () {
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({
      type: process.argv[3] ? process.argv[3].substr(2) : 'patch'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('bump', ['version'], function () {
  fs.readFile('./package.json', function (err, data) {
    if (err) {
      return;
    }
    return gulp.src(['./package.json', './bower.json'])
      .pipe(git.add())
      .pipe(git.commit('chore(core): bump to ' + JSON.parse(data).version));
  });
});

gulp.task('docs', function () {
  var dgeni = new Dgeni([
    new Dgeni.Package('sl-map', [
      require('dgeni-markdown'),
      require('dgeni-packages/jsdoc')
    ])
    .config(function (readFilesProcessor, writeFilesProcessor) {
      readFilesProcessor.basePath = path.resolve(__dirname);
      readFilesProcessor.sourceFiles = [
        {
          // Process all js files in `src` and its subfolders ...
          include: 'src/**/*.js',
          basePath: 'src'
        }
      ];
      writeFilesProcessor.outputFolder = 'docs';
    })
  ]);
  return dgeni.generate();
});

gulp.task('default', function () {
  runSequence('process-all', 'watch');
});
