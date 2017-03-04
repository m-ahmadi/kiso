module.exports = function (grunt) {
	
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-concat");
	// grunt.loadNpmTask("grunt-sass");
	
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		watch: {
			scripts: {
				files: [
					"!**/node_modules/**",
					"**/*.html",
					"css/**/*.css",
					"js/dist/**/*.js",
					"gruntfile.js"
				],
			// 	tasks: ["sass"],
				options: {
					spawn: false,
					reload: true
				}
			},
			livereload: {
				options: { livereload: true },
				files: [
					"!**/node_modules/**",
					"**/*.html",
					"css/**/*.css",
					"js/dist/**/*.js"
				]
			}
		}
	});
	grunt.registerTask("default", ["watch"]);
};