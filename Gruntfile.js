module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'js/*.js'],
      options: {
        // options here to override JSHint defaults
        browser: true,
        globals: {
          console: true,
          angular: true,
          remoteStorage: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>','css/sass/*.scss'],
      tasks: ['jshint','sass']
    },
    sass: {
      dist: {
        files: {
          'css/s.css': 'css/sass/s.scss'
        }
      }
    },
    copy: {
      dist: {
        files: [
          {expand:true, src: 'partials/*',dest: 'dist'},
          {expand:true, src: 'img/*',dest: 'dist'},
          {expand:true, src: 'css/*',dest: 'dist'},
          {expand:true, src: 'js/**',dest: 'dist'},
          {src: 'index.html',dest: 'dist/'},,
          {src: 'l_*.json',dest: 'dist/'}
        ]
      }
    },
    clean: {
      src: ['dist'],
      post: [
        "dist/css/**/*",
        "!dist/css/swl.css",
        "dist/js/*.js",
        "!dist/js/swl.min.js",
        "dist/js/vendor/*.js",
        "!dist/js/vendor/remoteStorage.js"
      ]
    },
    useref: {
      // specify which files contain the build blocks
      html: 'dist/index.html',
      temp: 'dist'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-useref'); // using this also loads grunt-contrib-concat, grunt-contrib-uglify and grunt-css
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('default', ['jshint', 'sass']);
  grunt.registerTask('dist', ['jshint','sass','clean:src','copy','useref','concat','uglify','cssmin','clean:post']);
};