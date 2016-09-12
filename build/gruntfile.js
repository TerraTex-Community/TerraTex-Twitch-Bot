module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            options: {
                //reporter: require('jshint-html-reporter'),
                //reporterOutput: 'build/reports/jshint-report.html',
                jshintrc: true
            },
            all: ['routes/**/*.*', 'public/javascripts/system/**/*.*']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('default', ['jshint']);
};