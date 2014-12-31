module.exports = function(grunt) {
  var version = '0.8.3';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js',
              'scripts/ItemMirror.js',
              'scripts/PathDriver.js',
              'scripts/SyncDriver.js',
	      'scripts/XooMLDriver.js',
              'scripts/FragmentEditor.js',
              'scripts/SyncDriver.js',
              'scripts/AssociationEditor.js',
              'scripts/XooMLExceptions.js',
              'scripts/ItemDriver.js',
              'scripts/XooMLUtil.js'],
      options: {
        // options listed http://www.jshint.com/docs/options
        globals: {
          bitwise: true,
          camelCase: true,
          curly: true,
          indent: 2,
          newcap: true,
          strict: true
        }
      }
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: "./scripts",
          name: "../node_modules/almond/almond",
          include: "ItemMirror",
//          insertRequire: ["ItemMirror"],
          out: "item-mirror.js",
          optimize: "none",
          useStrict: true,
          enforceDefine: true,
          wrap: {
            startFile: ["./LICENSE", "start.frag"],
            endFile: "end.frag"
          },
          //Introduced in 2.1.3: Some situations do not throw and stop the optimizer
          //when an error occurs. However, you may want to have the optimizer stop
          //on certain kinds of errors and you can configure those situations via
          //this option
          throwWhen: {
            //If there is an error calling the minifier for some JavaScript,
            //instead of just skipping that file throw an error.
            optimize: true
          }
        }
      }
    },

    yuidoc: {
      compile: {
        "name": "item-mirror",
        "description": "ItemMirror: a library for working with XooML to promote open cross platform tool usage",
        "version": version,
        "url": "https://github.com/KeepingFoundThingsFound/itemMirror",
        "options": {
          "linkNatives": "true",
          "attributesEmit": "true",
          "ignorePaths": ["dependencies", "./.hgcheck/hg-checklink-qJbfof", ".idea", "./ignore", "./test", "./documentation", "./build"],
          "exclude": "build",
          "paths": "./scripts",
          "outdir": "./documentation"
        }
      }
    },

    uglify: {
      my_target: {
        options: {
          mangle: false
        },
        files: {
          'item-mirror.min.js': ['item-mirror.js']
        }
      }
    },

    // Used for publishing the documentation onto gh-pages. This is
    // the free hosting that github gives to all projects. Placing the
    // YUIDoc generated documentation there makes the itemMirror API
    // public for all to view
    'gh-pages': {
      options: {
      base: './documentation'
      },
      src: '**/*'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask('document', ['jshint', 'yuidoc']);

  grunt.registerTask('default', ['jshint', 'yuidoc', 'requirejs', 'uglify']);

  grunt.registerTask('build', ['jshint', 'requirejs', 'uglify']);

};
