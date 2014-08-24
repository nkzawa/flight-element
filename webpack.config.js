module.exports = {
  entry: './lib/index',
  output: {
    filename: 'flight-element.js',
    library: 'flightElement',
    libraryTarget: 'umd',
    sourcePrefix: ''
  },
  externals: {
    'flight/lib/registry': {
      root: ['flight', 'registry'],
      commonjs2: ['flight', 'registry'],
      commonjs: ['flight', 'registry'],
      amd: 'flight/lib/registry'
    }
  }
};
