/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const filepath = (pathData, ext) => {
  switch (pathData.chunk.name) {
    case 'demo-page':
    case 'panel':
      return `demo/[name].${ext}`;
    default:
      return `[name].${ext}`;
  }
};

const getConfig = (isDev) => ({
  mode: 'development',
  entry: {
    'slider-plugin': './src/slider-plugin.ts',
    'demo-page': {
      import: './src/demo/demo-page.js',
      dependOn: 'panel',
    },
    panel: './src/Panel.ts',
  },
  output: {
    filename: (pathData) => filepath(pathData, 'js'),
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
  devtool: isDev ? 'eval-cheap-module-source-map' : 'hidden-nosources-source-map',
  optimization: {
    minimize: !isDev,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            pure_funcs: ['console.warn', 'console.error'],
          },
        },
      }),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Slider plugin demo page',
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
      filename: (pathData) => filepath(pathData, 'css'),
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
});

export default (env, argv) => {
  let isDev = true;
  if (argv.mode === 'production') {
    isDev = false;
  }

  return getConfig(isDev);
};
