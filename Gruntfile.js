module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bower: grunt.file.readJSON('bower.json'),
        uglify: {
            options: {
                banner: '/*! This is hwcrypto.js <%= bower.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
            },
            build: {
                src: 'hwcrypto.js',
                dest: 'build/<%= pkg.name %>.min.js'
            },
            dist: {
                options: {
                    beautify: true,
                    mangle: false,
                    compress: false
                },
                src: 'hwcrypto.js',
            }
        },
        jshint: {
            app: {
              src: ['hwcrypto.js', 'test/*.js'],
            },
        },
        mocha: {
             test: {
                src: ['test/api.html'],
                options: {
                    run: true,
                },
            },
        },

        connect: {
            server: {
                options: {
                    keepalive: true,
                    port: 8888,
                    open: 'http://localhost:8888/test/okbrowser.html'
                }
            }
        }
    });

    // Minification
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // code check
    grunt.loadNpmTasks('grunt-contrib-jshint');
    // development server
    grunt.loadNpmTasks('grunt-contrib-connect');
    // testing
    grunt.loadNpmTasks('grunt-mocha');

    // Default task(s).
    grunt.registerTask('default', ['mocha']);
};
