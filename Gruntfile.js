module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! This is hwcrypto.js <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
            },
            minify: {
                src: 'build/hwcrypto.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            },
            beautify: {
                options: {
                    beautify: true,
                    mangle: false,
                    compress: false
                },
                src: 'build/hwcrypto.js',
                dest: 'dist/hwcrypto.js'
            },
            release: {
                options: {
                    beautify: true,
                    mangle: false,
                    compress: false
                },
                src: 'build/hwcrypto.js',
                dest: 'hwcrypto.js'
            }
        },
        jshint: {
            src: {
                src: ['src/hwcrypto.js', 'test/*.js'],
            },
            release: {
                src: ['hwcrypto.js']
            }
        },
        includereplace: {
            build: {
                options: {
                    globals: {
                        hwcryptoversion: '<%= pkg.version %>'
                    }
                },
                files: [
                    {src: 'hwcrypto.js', dest: 'build/', expand: true, cwd: 'src'}
                ]
            },
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
        clean: ['build', 'dist']
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
    grunt.registerTask('build', ['clean', 'jshint:src', 'includereplace', 'uglify:minify', 'uglify:beautify']);
    grunt.registerTask('dist', ['build', 'bower']);
    grunt.registerTask('default', ['dist', 'mocha']);
    grunt.registerTask('release', ['sync', 'build', 'includereplace:build', 'uglify:release', 'jshint:release'])
};
