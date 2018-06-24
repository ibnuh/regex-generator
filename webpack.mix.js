let mix = require('laravel-mix');

mix.options({
    uglify: {
        uglifyOptions: {
            compress: {
                drop_console: true,
            }
        }
    }
});

mix.js('source/js/app.js', 'public/js/app.js');
mix.styles(['source/css/bootstrap.css', 'source/css/app.css'], 'public/css/app.css');

mix.disableNotifications();