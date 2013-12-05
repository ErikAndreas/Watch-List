module.exports = function (grunt) {
  "use strict";
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'js/*.js'],
      options: {
        // options here to override JSHint defaults
        jshintrc: 'a.jshintrc'
      }
    },
    jsbeautifier: {
      modify: {
        src: ['Gruntfile.js', 'js/*.js'],
        options: {
          config: 'a.jsbeautifyrc'
        }
      },
      verify: {
        src: ['Gruntfile.js', 'js/*.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: 'a.jsbeautifyrc'
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>', 'css/sass/*.scss'],
      tasks: ['jshint', 'sass']
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
        files: [{
          expand: true,
          src: 'partials/*',
          dest: 'dist'
        }, {
          src: 'index.html',
          dest: 'dist/'
        }, {
          src: 'l_*.json',
          dest: 'dist/'
        }]
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
    usemin: {
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
    imagemin: {
      png: {
        options: {
          optimizationLevel: 7
        },
        files: [{
          expand: true,
          src: ['img/*.png'],
          dest: 'dist',
          ext: '.png'
        }]
      },
      jpg: {
        options: {
          progressive: true
        },
        files: [{
          expand: true,
          src: ['img/*.jpg'],
          dest: 'dist',
          ext: '.jpg'
        }]
      }
    },
    rev: {
      files: {
        src: ['dist/js/*.js', 'dist/css/*.css']
      }
    },
    lingua: {
      extract: {
        potDest: 'translations/messages.pot', // dest path must exist
        scanDirs: ['.', 'partials', 'js']
      },
      po2json: {
        outPrefix: 'l_',
        src: ['translations/*.po'],
        dest: ''
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-rev');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-lingua');

  grunt.registerTask('default', ['jsbeautifier:verify', 'jshint', 'sass']);
  grunt.registerTask('cleanup', ['jsbeautifier:modify', 'jshint']);
  grunt.registerTask('dist', ['jshint', 'sass', 'clean:src', 'useminPrepare', 'concat', 'uglify', 'copy', 'cssmin', 'rev', 'usemin', 'imagemin']);
};
