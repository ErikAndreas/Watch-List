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
          {src: 'index.html',dest: 'dist/'},
          {src: 'js/vendor/remoteStorage.js',dest:'dist/'},
          {src: 'l_*.json',dest: 'dist/'}
        ]
      }
    },
    clean: {
      src: ['dist']
    },
    useminPrepare: {
      html: 'index.html',
      options: {
        dest: 'dist'
      }
    },
    usemin:{
      html: ['dist/*.html'],
      css: ['dist/css/*.css'],
      options: {
        dirs: ['dist']
      }
    },
    img: {
      optimize: {
        src: 'dist/img'
      }
    },
    rev: {
      files: {
        src: ['dist/js/*.js', 'dist/css/*.css']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-rev');
  grunt.loadNpmTasks('grunt-img');

  grunt.registerTask('default', ['jshint', 'sass']);
  grunt.registerTask('dist', ['jshint','sass','clean:src','useminPrepare','concat','uglify','copy','cssmin','rev','usemin','img:optimize']);
};