const webpack = require('webpack');

module.exports = {
  // Alte configurații existente
  resolve: {
    
    fallback: {
        "process": require.resolve('process/browser'),
        'process/browser': require.resolve('process/browser'),
        process: require.resolve('process/browser'),
        
      // Adaugă alte module dacă este necesar
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};
