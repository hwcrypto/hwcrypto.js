module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! This is hwcrypto.js <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
            },
            build: {
                src: 'hwcrypto.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            },
            dist: {
                options: {
                    beautify: true,
                    mangle: false,
                    compress: false
                },
                src: 'hwcrypto.js',
                dest: 'dist/hwcrypto.js'
            }
        },
        jshint: {
            app: {
                src: ['hwcrypto.js', 'test/*.js'],
            },
        },
        includereplace: {
            dist: {
                options: {
                    prefix: '<!-- @@',
                    suffix: ' -->',
                    includesDir: 'snippets/'
                },
                files: [
                    {src: 'sign.html', dest: 'dist/', expand: true, cwd: 'demo'},
                    {src: '*.html', dest: 'dist/', expand: true, cwd: 'test'},
                    {src: '*.js', dest: 'dist/', expand: true, cwd: 'test'},
                    {src: 'hex2base.js', dest: 'dist/'}
                ]
            }
        },
        mocha: {
            test: {
                src: ['dist/api.html'],
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
        },
        bower: {
            build: {
                dest: 'dist',
                js_dest: 'dist/js',
                css_dest: 'dist/css'
            }
        },
        clean: ['dist']
    });
    // Minification
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // code check
    grunt.loadNpmTasks('grunt-contrib-jshint');
    // development server
    grunt.loadNpmTasks('grunt-contrib-connect');
    // testing
    grunt.loadNpmTasks('grunt-mocha');
    // version number syncing before releasing
    grunt.loadNpmTasks('grunt-sync-pkg');
    // file templates
    grunt.loadNpmTasks('grunt-include-replace');
    // copy bower components
    grunt.loadNpmTasks('grunt-bower');
    // Clean up
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
    grunt.registerTask('build', ['clean', 'bower', 'includereplace', 'uglify']);
    grunt.registerTask('default', ['build', 'mocha']);
};
