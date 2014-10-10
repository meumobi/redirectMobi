'use strict';

module.exports = function (grunt) {
	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Define the configuration for all the tasks
	grunt.initConfig({
		mobileRedirector: {
			app: require('./bower.json').appPath || 'app',
			dist: 'dist'
		},
		
		 // The actual grunt server settings
		connect: {
			options: {
				port: 9000,
				// Change this to '0.0.0.0' to access the server from outside.
				hostname: 'localhost',
				livereload: 35729
			},
			livereload: {
				options: {
					open: true,
					base: [
						'.tmp',
						'<%= mobileRedirector.app %>'
					]
				}
			},
			test: {
				options: {
					port: 9001,
					base: [
						'.tmp',
						'test',
						'<%= mobileRedirector.app %>'
					]
				}
			},
			dist: {
				options: {
					base: '<%= yeoman.dist %>'
				}
			}
		},
		
	// Empties folders to start fresh
	clean: {
		dist: {
			files: [{
				dot: true,
				src: [
					'.tmp',
					'<%= yeoman.dist %>/*',
					'!<%= yeoman.dist %>/.git*'
				]
			}]
		},
		server: '.tmp'
		},
		// Automatically inject Bower components into the app
		'bower-install': {
		app: {
			html: '<%= mobileRedirector.app %>/index.html',
			ignorePath: '<%= mobileRedirector.app %>/'
		}
	},
	// Renames files for browser caching purposes
	rev: {
		dist: {
			files: {
				src: [
					'<%= yeoman.dist %>/scripts/{,*/}*.js',
					'<%= yeoman.dist %>/styles/{,*/}*.css',
					'<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
					'<%= yeoman.dist %>/styles/fonts/*'
				]
			}
		}
	},
	// Reads HTML for usemin blocks to enable smart builds that automatically
	// concat, minify and revision files. Creates configurations in memory so
	// additional tasks can operate on them
	useminPrepare: {
		html: '<%= mobileRedirector.app %>/index.html',
		options: {
			dest: '<%= yeoman.dist %>'
		}
	},

	// Performs rewrites based on rev and the useminPrepare configuration
	usemin: {
		html: ['<%= yeoman.dist %>/{,*/}*.html'],
		css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
		options: {
			assetsDirs: ['<%= yeoman.dist %>']
		}
	},

	// The following *-min tasks produce minified files in the dist folder
	imagemin: {
		dist: {
			files: [{
				expand: true,
				cwd: '<%= mobileRedirector.app %>/images',
				src: '{,*/}*.{png,jpg,jpeg,gif}',
				dest: '<%= yeoman.dist %>/images'
			}]
		}
	},
	svgmin: {
		dist: {
			files: [{
				expand: true,
				cwd: '<%= mobileRedirector.app %>/images',
				src: '{,*/}*.svg',
				dest: '<%= yeoman.dist %>/images'
			}]
		}
	},
	htmlmin: {
		dist: {
			options: {
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
				removeCommentsFromCDATA: true,
				removeOptionalTags: true
			},
			files: [{
				expand: true,
				cwd: '<%= yeoman.dist %>',
				src: ['*.html', 'views/{,*/}*.html'],
				dest: '<%= yeoman.dist %>'
			}]
		}
	},

	// Allow the use of non-minsafe AngularJS files. Automatically makes it
	// minsafe compatible so Uglify does not destroy the ng references
	ngmin: {
		dist: {
			files: [{
				expand: true,
				cwd: '.tmp/concat/scripts',
				src: '*.js',
				dest: '.tmp/concat/scripts'
			}]
		}
	},

	// Replace Google CDN references
	cdnify: {
		dist: {
			html: ['<%= yeoman.dist %>/*.html']
		}
	},

	// Copies remaining files to places other tasks can use
	copy: {
		dist: {
			files: [{
				expand: true,
				dot: true,
				cwd: '<%= mobileRedirector.app %>',
				dest: '<%= yeoman.dist %>',
				src: [
					'*.{ico,png,txt}',
					'.htaccess',
					'*.html',
					'views/{,*/}*.html',
					'bower_components/**/*',
					'images/{,*/}*.{webp}',
					'fonts/*'
				]
			}, {
				expand: true,
				cwd: '.tmp/images',
				dest: '<%= yeoman.dist %>/images',
				src: ['generated/*']
			}]
		},
		styles: {
			expand: true,
			cwd: '<%= mobileRedirector.app %>/styles',
			dest: '.tmp/styles/',
			src: '{,*/}*.css'
		}
	},

	// Run some tasks in parallel to speed up the build process
	concurrent: {
		server: [
			'copy:styles'
		],
		test: [
			'copy:styles'
		],
		dist: [
			'copy:styles',
			'imagemin',
			'svgmin'
		]
	},


	});
};