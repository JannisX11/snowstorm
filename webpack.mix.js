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
				test: /\.png/,
				type: 'asset/inline',
				generator: {
					dataUrl: content => {
						let path = './dist' + content.toString().split('"')[1].replace(/\?.*/, '');
						let base64 = require('fs').readFileSync(path, {encoding: 'base64'});
						return 'data:image/png;base64,' + base64;
					}
				}
			}
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
	.vue()
	.setPublicPath('dist');
