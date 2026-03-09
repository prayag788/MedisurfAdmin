const path = require('path')
const rewireAliases = require('react-app-rewire-aliases')
const webpack = require('webpack')

module.exports = function override(config, env) {
  // Temporarily disable PostCSS RTL to fix build issues
  // require('react-app-rewire-postcss')(config, {
  //   plugins: loader => [require('postcss-rtl')()]
  // })

  // Add polyfills for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    util: require.resolve('util'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify/browser'),
    url: require.resolve('url'),
    vm: require.resolve('vm-browserify'),
    process: require.resolve('process/browser'),
    zlib: require.resolve('browserify-zlib'),
    path: require.resolve('path-browserify'),
    fs: false,
    net: false,
    tls: false,
    child_process: false,
  }

  config = rewireAliases.aliasesOptions({
    '@src': path.resolve(__dirname, 'src'),
    '@assets': path.resolve(__dirname, 'src/@core/assets'),
    '@components': path.resolve(__dirname, 'src/@core/components'),
    '@layouts': path.resolve(__dirname, 'src/@core/layouts'),
    '@store': path.resolve(__dirname, 'src/redux'),
    '@styles': path.resolve(__dirname, 'src/@core/scss'),
    '@configs': path.resolve(__dirname, 'src/configs'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@hooks': path.resolve(__dirname, 'src/utility/hooks'),
  })(config, env)

  // Configure sass-loader to use modern sass instead of node-sass
  const sassRule = config.module.rules.find(
    rule =>
      rule.oneOf &&
      rule.oneOf.some(oneOf => oneOf.test && oneOf.test.toString().includes('scss|sass'))
  )

  if (sassRule) {
    sassRule.oneOf.forEach(oneOf => {
      if (oneOf.test && oneOf.test.toString().includes('scss|sass')) {
        const sassLoader = oneOf.use.find(
          use => typeof use === 'string' && use.includes('sass-loader')
        )
        if (sassLoader) {
          oneOf.use[oneOf.use.indexOf(sassLoader)] = {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: ['node_modules', 'src/assets'],
              },
            },
          }
        }
      }
    })
  }

  // Disable source map warnings for missing files
  config.module.rules.push({
    test: /\.(js|css)$/,
    use: 'source-map-loader',
    enforce: 'pre',
    exclude: [
      /node_modules\/react-is-mounted-hook/,
      /bootstrap\.min\.css\.map$/,
      /react-router-dom\/esm\//,
      /process\/browser\.js/,
    ],
  })

  // Disable source map warnings globally
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /ENOENT: no such file or directory/,
    /react-router-dom\/esm\/react-router-dom\.js/,
    /process\/browser\.js/,
  ]

  // Only apply optimizations in production
  if (env === 'production' && config.optimization) {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    }
  }

  // Disable CSS optimization to fix PostCSS plugin error
  if (config.optimization && config.optimization.minimizer) {
    config.optimization.minimizer = config.optimization.minimizer.filter(
      minimizer => !minimizer.constructor.name.includes('CssMinimizerPlugin')
    )
  }

  // Add Buffer polyfill
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process',
    })
  )

  // Add performance optimizations only in production
  if (env === 'production') {
    config.performance = {
      hints: 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    }
  }

  return config
}
