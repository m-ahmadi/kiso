module.exports = function (grunt) {
	
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-concat");
	// grunt.loadNpmTask("grunt-sass");
	
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		watch: {
			scripts: {
				files: [
					"sass/**/*.scss",
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
					"**/*.htm",
					"sass/**/*.scss",
					"js/dist/**/*.js"
				]
			}
		}
	});
	grunt.registerTask("default", ["watch"]);
};