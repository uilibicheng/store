module.exports = function(api) {
  api.cache(true)

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          useBuiltIns: 'usage',
          corejs: {version: 3, proposals: true},
        },
      ],
      '@babel/preset-react',
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          corejs: {version: 3, proposals: true},
        },
      ],
      '@babel/plugin-proposal-class-properties',
      'styled-jsx/babel',
      '@babel/plugin-syntax-dynamic-import',
      [
        'import',
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: 'css',
        },
      ],
    ],
  }
}
