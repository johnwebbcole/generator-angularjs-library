'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var AngularjsLibraryGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../../package.json');

    // Try to determine the name
    this.argument('appname', {
      type: String,
      required: false
    });
    this.appname = this.appname || path.basename(process.cwd());
  },

  prompting: function () {

    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the AngularJS library generator!'
    ));

    var prompts = [
      {
        type: 'input',
        name: 'authorName',
        message: chalk.yellow('\n\n********************************************************************************\n' + 'Before we get started, let me verify your personal details:\n********************************************************************************\n'),
        validate: function (input) {
          if (/.+/.test(input)) {
            return true;
          }
          return 'Please enter your full name';
        },
        default: this.user.git.name
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'Your email address:',
        validate: function (input) {
          if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(input)) {
            return true;
          }
          return 'Please enter a valid email address';
        },
        default: this.user.git.email
      },
      {
        type: 'input',
        name: 'libraryName',
        message: chalk.yellow('\n\n********************************************************************************\n' + 'Awesome, so how would you like to call your AngularJS library:\n********************************************************************************\n') + '\n' +
          'You can use spaces and capitals and use a name like "Your Library".' + '\n\n' +
          'The full library name is used in documentation: "Your Library".' + '\n\n' +
          'The name is automatically camelized as module name in AngularJS: "yourLibrary"\n' +
          'and slugified for file and package names e.g. "your-library.js":\n\n' +
          'Library name:',
        validate: function (input) {
          if (/.+/.test(input)) {
            return true;
          }
          return 'Please enter a library name';
        },
        default: this.appname
      }
    ];

    this.prompt(prompts, function (props) {

      this.props = {

        author: {
          name: props.authorName,
          email: props.authorEmail
        },

        // Originally a humanized string like "Project Angular_Library"
        libraryName: {

          // String originally entered by user => "Project Angular_Library"
          original: props.libraryName,

          // Camelized => projectAngularLibrary
          camelized: this._.camelize(this._.underscored(props.libraryName)),

          // Dasherized (underscored and camelized to dashes) => project-angular-library
          // issue 28: convert 1st char of libraryName to lowercase to avoid prefixing '-'
          //  after upgrading library could just replace with decapitalize()
          dasherized: this._.dasherize(props.libraryName.charAt(0).toLowerCase() + props.libraryName.slice(1)),

          // Slugified (whitespace and special chars replaced by dashes (great for url's)) => project-angular-library
          slugified: this._.slugify(props.libraryName),

          // Array of parts => [ 'project', 'angular', 'library' ]
          parts: this._.slugify(props.libraryName).split('-')
        },
        includeAngularModuleResource: props.includeAngularModuleResource,
        includeAngularModuleCookies: props.includeAngularModuleCookies,
        includeAngularModuleSanitize: props.includeAngularModuleSanitize
      };



      this.config.set('props', this.props);

      done();
    }.bind(this));
  },

  writing: {
    /*
    app: function () {
      this.dest.mkdir('app');
      this.dest.mkdir('app/templates');

      this.src.copy('_package.json', 'package.json');
      this.src.copy('_bower.json', 'bower.json');
    },

    projectfiles: function () {
      this.src.copy('editorconfig', '.editorconfig');
      this.src.copy('jshintrc', '.jshintrc');
    }*/

    /**
     * Create library files
     */
    createLibraryFiles: function createLibraryFiles() {

      this.mkdir('src');

      this.template('src/library.module.js', this.props.libraryName.camelized + '.module.js', {
        config: this.props
      });

      this.template('src/library.module.spec.js', this.props.libraryName.camelized + '.module.spec.js', {
        config: this.props
      });

    },

    /**
     * Create Gulp configuration
     */
    createGulpfile: function createGulpfile() {
      this.template('gulpfile.js', './gulpfile.js', {
        config: this.props
      });
    },

    /**
     * Create Package Json
     */
    createPackageJson: function createPackageJson() {
      this.template('_package.json', './package.json', {
        config: this.props
      });
    },

    /**
     * Create Bower files
     */
    createBowerFiles: function createBowerFiles() {
      this.template('_bower.json.ejs', './bower.json', {
        config: this.props
      });
      this.copy('bowerrc', '.bowerrc');
    },

    /**
     * Create Karma unit test configuration
     */
    createKarmaConfig: function createKarmaConfig() {
      this.template('karma.conf.js', 'karma.conf.js', {
        config: this.props
      });
    },

    /**
     * Create README.md
     */
    createReadmeMd: function createReadmeMd() {
      this.template('README.md', 'README.md', {
        config: this.props
      });
    },

    /**
     * Create LICENSE.txt
     */
    createLicenseTxt: function createLicenseTxt() {
      this.template('LICENSE', 'LICENSE', {
        config: this.props
      });
    },

    createProjectFiles: function createProjectFiles() {
      this.copy('editorconfig', '.editorconfig');
      this.copy('_eslintrc.js', '.eslintrc.js');
      this.copy('src/_eslintrc.js', 'src/.eslintrc.js');
      this.copy('_eslintignore', '.eslintignore');
      this.copy('gitignore', '.gitignore');
      this.copy('travis.yml', '.travis.yml');
    }

  },

  end: function () {
    this.installDependencies();
  }
});

module.exports = AngularjsLibraryGenerator;
