import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';

const isDev = process.env.NODE_ENV === 'development';

const filename = (ext) => (
  isDev
    ? `[name].[fullhash:7].${ext}`
    : `[name].${ext}`
);
const filepath = (pathdata, ext) => (
  pathdata.chunk.name === 'demo-page'
    ? `demo/${filename(ext)}`
    : filename(ext)
);

export default {
  mode: 'development',
  entry: {
    'slider-plugin': './src/slider-plugin.ts',
    'demo-page': './src/demo/demo-page.js',
  },
  output: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    filename: (pathdata) => filepath(pathdata, 'js'),
    path: path.resolve('dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: isDev ? 'eval-cheap-module-source-map' : false,
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Slider plugin test',
      template: './src/demo/demo-page.html',
      filename: 'demo/demo-page.html',
    }),
    new FaviconsWebpackPlugin({
      logo: './src/demo/favicon.png',
      outputPath: './demo/assets',
      publicPath: 'demo',
      mode: 'light',
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new MiniCssExtractPlugin({
      filename: (pathdata) => filepath(pathdata, 'css'),
    }),
  ],
  externals: {
    jquery: 'jQuery',
  },
  devServer: {
    open: '/demo/demo-page.html',
    hot: false,
    port: 4200,
    client: {
      overlay: true,
      reconnect: 1,
    },
    static: './dist',
  },
  stats: 'minimal',
};
