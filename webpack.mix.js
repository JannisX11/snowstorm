let mix = require('laravel-mix');

mix.webpackConfig({
    module: {
        rules: [
			{
				test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
				loader: require.resolve('url-loader'),
				options: {
				  limit: 100000,
				  name: 'static/media/[name].[hash:8].[ext]',
				},
			  },
        ],
    }
});

mix.js('src/app.js', 'dist/')
    .setPublicPath('dist');
    