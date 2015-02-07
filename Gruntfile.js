module.exports =  function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: ['Gruntfile.js', 'app.js']
    },
    mochaTest: {
      test: {
        options : {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },
    wiredep: {
      task: {
	       src: [
          '*.html'
          ],
          options: {}
      }
    },

    watch: {
      files: ['<%= jshint.files%>', 'test/**/*.js'],
      tasks: ['jshint', 'mochaTest']
    }

  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.registerTask('default', ['watch']);
};
