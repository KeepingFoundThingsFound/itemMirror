module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'scripts/ItemMirror.js',
              'scripts/PathDriver.js', 'scripts/SyncDriver.js'],
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
          name: "ItemMirror",
          out: "./build/ItemMirror.dev.js",
          optimize: "none",
          useStrict: true,
          enforceDefine: true,
          wrap: {
            startFile: ["./LICENSE"]
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
        "name": "ItemMirror",
        "description": "ItemMirror: a library for working with XooML to promote open cross platform tool usage",
        "version": "0.8.2",
        "url": "https://github.com/KeepingFoundThingsFound/itemMirrorWebClient",
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
          './build/ItemMirror.min.js': ['./build/ItemMirror.dev.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('document', ['jshint', 'yuidoc']);
  
  grunt.registerTask('default', ['jshint', 'yuidoc', 'requirejs', 'uglify']);
  
  grunt.registerTask('build', ['jshint', 'requirejs', 'uglify']);

};
