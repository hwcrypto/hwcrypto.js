module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! This is hwcrypto.js <%= pkg.version %> generated on <%= grunt.template.today("yyyy-mm-dd") %> */\n/* DO NOT EDIT (use src/hwcrypto.js) */\n',
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
                    banner: '/* Legacy dependencies for hwcrypto.js <%= pkg.version %> generated on <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files: {
                    'dist/hwcrypto-legacy.js': ['bower_components/js-polyfills/typedarray.js',
                                                'bower_components/native-promise-only/lib/npo.src.js']
                }
            }
        },
        eslint: {
            src: ['src/**/*.js']
        },
        browserify: {
            dist: {
                options: {
                    browserifyOptions: {
                        standalone: 'hwcrypto'
                    },
                    transform: [['babelify', {presets: ['es2015']}]]
                },        
                src: ['src/hwcrypto.js'],
                dest: 'hwcrypto.js',
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
                    {src: 'hwcrypto.js', dest: 'build/', expand: true}
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
                    log: true,
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
        "bower-install-simple": {
            dist: {}
        },
        clean: ['build', 'dist']
    });
    // Minification
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // eslint
    grunt.loadNpmTasks("gruntify-eslint");
    // ES6 => browser compaitble ES5
    grunt.loadNpmTasks('grunt-browserify');
    // development server
    grunt.loadNpmTasks('grunt-contrib-connect');
    // testing
    grunt.loadNpmTasks('grunt-mocha');
    // version number syncing before releasing
    grunt.loadNpmTasks('grunt-sync-pkg');
    // file templates
    grunt.loadNpmTasks('grunt-include-replace');
    // perform bower install
    grunt.loadNpmTasks('grunt-bower-install-simple');
    // copy bower components
    grunt.loadNpmTasks('grunt-bower');
    // Clean up
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
    grunt.registerTask('build', ['clean', 'browserify', 'includereplace', 'uglify:minify', 'uglify:beautify']);
    grunt.registerTask('dist', ['eslint', 'sync', 'build', 'bower-install-simple', 'bower', 'uglify:legacy']);
    grunt.registerTask('default', ['dist', 'mocha']);
    grunt.registerTask('release', ['sync', 'build', 'includereplace:build', 'uglify:release', 'jshint:release'])
};
