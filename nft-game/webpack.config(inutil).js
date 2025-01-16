const webpack = require('webpack');

module.exports = {
  // Alte configurații existente
  resolve: {
    fallback: {
      fs: false,
      // "assert": require.resolve("assert"),
      // "os": require.resolve("os-browserify"),
      // "url": require.resolve("url"),
      // "fs": false,
      //   "tls": false,
      //   "net": false,
      //   "path": false,
      //   "zlib": false,
      //   "http": false,
      //   "https": false,
      //   "stream": false,
      //   "crypto": false,
      //   "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
      // Adaugă alte module necesare, dacă este cazul
    }
  },





  
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
