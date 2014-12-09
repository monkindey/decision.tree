/**
 * @author monkindey
 * @date 2014.12.5
 * @decription decrision tree项目grunt配置
 */
'use strict';
module.exports = function(grunt) {
	var devPath = 'assets/index.js';
	var destPath = 'assets/bundle.js';
	var homePage = 'index.html';
	var tasks = ['browserify'];
	// Task configuration
	grunt.initConfig({
		// 检测js代码的严谨性
		jshint: {
			js: {
				// src: [devPath + '*.js']
			}
		},
		// mocha test
		mochaTest: {
			test: {

			}
		},
		// 赋予前端模块化思想
		browserify: {
			js: {
				src: devPath,
				dest: destPath,
			}
		},
		// 压缩js
		uglify: {
			options: {
				sourceMap: true,
				banner: '//<%= grunt.template.today("yyyy-mm-dd") %>'
			},
			// compact format
			js: {
				src: [],
				dest: []
			}
		},
		replace: {
			timestamp: {
				src: homePage,
				overwrite: true,
				replacements: [{
					from: new RegExp(destPath + '(\\?t=\\d*)?'),
					to: destPath + '?t=<%=grunt.template.date("yyyymmddHHMMss")%>'
				}]
			},
		},
		watch: {
			main: {
				files: ['assets/**'],
				tasks: tasks
			}
		}
	});

	grunt.registerTask('default', function() {
		grunt.task.run(tasks);
	});

	grunt.registerTask('watchfile', ['watch:main']);

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');
	// grunt.loadNpmTasks('grunt-contrib-jshint');
	// grunt.loadNpmTasks('grunt-text-replace');
	// grunt.loadNpmTasks('grunt-mocha-test');
	// grunt.loadNpmTasks('grunt-contrib-uglify');
	// grunt.loadNpmTasks('grunt-contrib-cssmin');
	// grunt.loadNpmTasks('grunt-contrib-imagemin');
};