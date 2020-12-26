let mix = require('laravel-mix');
let path = require('path');
let {WebpackBundleSizeAnalyzerPlugin} = require('webpack-bundle-size-analyzer');

let alias = {
	'three/examples/jsm/controls/OrbitControls.js': path.join(__dirname, 'node_modules/three/examples/jsm/controls/OrbitControls.js'),
	'three': path.join(__dirname, 'node_modules/three/build/three.module.js'),
	'wintersky': path.join(__dirname, 'node_modules/wintersky/dist/wintersky.esm.js')
}
if (process.env.NODE_ENV == 'development' && __dirname.includes('snowstorm\\snowstorm')) {
	alias['wintersky'] = path.join(__dirname, './../wintersky/dist/wintersky.esm.js')
}

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
	},
	resolve: {
		extensions: ['.js'],
		modules: ['node_modules'],
		alias
	},
	plugins: [
	  new WebpackBundleSizeAnalyzerPlugin('./plain-report.txt')
	]
});

mix.js('src/app.js', 'dist/')
	.setPublicPath('dist');
