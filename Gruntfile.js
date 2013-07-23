module.exports = function(grunt) {
  "use strict";
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
  grunt.loadNpmTasks('grunt-lingua');

  /*
  grunt.registerMultiTask('lingua','tooling for lingua', function() {
    var po2json = require('po2json');
    var path = require('path');
    if ('extract' === this.target) {
      var args = 'extract -F babel.cfg -k _n:1,2 -k _ -o'.split(' ');
      args.push(this.data.potDest);
      args = args.concat(this.data.scanDirs);
      var child = grunt.util.spawn({
        cmd: 'pybabel',
        args: args,
        opts: { stdio: 'inherit', stderr: 'inherit' }
      },this.async());
    } else if ('po2json' === this.target) { // https://github.com/rkitamura/grunt-po2json
      var prefix = this.data.outPrefix;
      this.files.forEach(function(line) {
        line.src.forEach(function(file) {
          var data = po2json.parseSync(file);
          var filename = path.basename(file, (path.extname(file)));
          if (prefix) filename = prefix + filename;
          var dest = path.join(line.dest, filename + '.json');
          //grunt.file.write(dest, JSON.stringify(data));
          grunt.log.writeln('File "' + dest + '" created.');
        });
      });
    } else {
      grunt.log.writeln('No such target');
    }
  });*/

  grunt.registerTask('default', ['jshint', 'sass']);
  grunt.registerTask('dist', ['jshint','sass','clean:src','useminPrepare','concat','uglify','copy','cssmin','rev','usemin','img:optimize']);
};
