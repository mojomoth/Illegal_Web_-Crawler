import path from 'path';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import nodeExternals from 'webpack-node-externals';

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  entry: {
    app: './src/index.js'
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].js',
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    // new TerserPlugin({
    //   sourceMap: true,
    // }),
  ],
  resolve: {
    modules: [
      path.join(__dirname),
      'node_modules'
    ],
  }
};
