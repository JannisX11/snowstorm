let mix = require('laravel-mix');

mix.js('src/app.js', 'dist/')
    //.sass('css/app.scss', 'dist/')
    .setPublicPath('dist');
