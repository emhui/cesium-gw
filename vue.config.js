const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const cesiumSource = 'node_modules/cesium/Source';
const cesiumjs = '../Build/Cesium/Cesium.js';
const cesiumWorkers = '../Build/Cesium/Workers';
const cesiumThirdParty = '../Build/Cesium/ThirdParty';



module.exports = {
	configureWebpack: {
		amd: {
			toUrlUndefined: true
		},
		plugins: [
			new CopyWebpackPlugin([
				{ from: path.join(cesiumSource, cesiumjs), to: 'Cesium/Cesium.js' },
				{ from: path.join(cesiumSource, cesiumThirdParty), to: 'Cesium/ThirdParty' },
				{ from: path.join(cesiumSource, 'Assets'), to: 'Cesium/Assets' },
				{ from: path.join(cesiumSource, 'Widgets'), to: 'Cesium/Widgets' },
				{ from: path.join(cesiumSource, cesiumWorkers), to: 'Cesium/Workers' }
			]),
			new webpack.DefinePlugin({
				CESIUM_BASE_URL: JSON.stringify('Cesium')
			})
		],
		devServer: {
			proxy: {
				'/api': {
					target: 'http://localhost:8080',// 你要请求的后端接口ip+port
					changeOrigin: true,// 允许跨域，在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
					ws: true, // 开启webSocket
					pathRewrite: {
						'^/api': '',// 替换成target中的地址
					}
				}
			}
		}
	}
}