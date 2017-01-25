module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bowerpkg: grunt.file.readJSON('bower.json'),
        uglify: {
            options: {
                banner: '/*! This is hwcrypto.js <%= bowerpkg.version %> generated on <%= grunt.template.today("yyyy-mm-dd") %> */\n/* DO NOT EDIT (use src/hwcrypto.js) */\n',
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
            },
            legacy: {
                options: {
                    banner: '/* Legacy dependencies for hwcrypto.js <%= bowerpkg.version %> generated on <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files: {
                    'hwcrypto-legacy.js': ['bower_components/js-polyfills/typedarray.js',
                                                'bower_components/native-promise-only/lib/npo.src.js']
                }
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
                        hwcryptoversion: '<%= bowerpkg.version %>'
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
    // file templates
    grunt.loadNpmTasks('grunt-include-replace');
    // copy bower components
    grunt.loadNpmTasks('grunt-bower');
    // Clean up
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
    grunt.registerTask('build', ['clean', 'jshint:src', 'includereplace', 'uglify:minify', 'uglify:beautify']);
    grunt.registerTask('dist', ['build', 'bower', 'uglify:legacy']);
    grunt.registerTask('default', ['dist', 'mocha']);
    grunt.registerTask('publish', ['build', 'includereplace:build', 'uglify:release', 'uglify:legacy', 'jshint:release'])
};
