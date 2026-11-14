// Configuración de Karma + Jasmine para probar componentes React (con cobertura de código)
// En Linux (GitHub Actions) se usa la ruta estándar; en Windows y macOS karma-chrome-launcher detecta Chrome solo
if (!process.env.CHROME_BIN && process.platform === 'linux') process.env.CHROME_BIN = '/usr/bin/google-chrome';

const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'webpack'],
    files: ['src/test/index.js', { pattern: 'public/img/**/*', included: false, served: true, watched: false }],
    proxies: { '/img/': '/base/public/img/' },
    preprocessors: { 'src/test/index.js': ['webpack'] },

    webpack: {
      mode: 'development',
      devtool: false,
      module: {
        rules: [
          // El package.json usa "type": "module": permite importar './archivo' sin extensión
          { test: /\.m?js$/, resolve: { fullySpecified: false } },
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
              configFile: false,
              babelrc: false,
              presets: [
                ['@babel/preset-env', { targets: { chrome: '100' } }],
                ['@babel/preset-react', { runtime: 'automatic' }],
              ],
              // Instrumenta solo el código fuente (no los .spec ni la carpeta de tests)
              plugins: [
                [
                  'istanbul',
                  { exclude: ['**/*.spec.js', '**/*.spec.jsx', 'src/test/**'] },
                ],
              ],
            },
          },
        ],
      },
      resolve: { extensions: ['.js', '.jsx'] },
    },

    reporters: ['progress', 'kjhtml', 'coverage'],

    coverageReporter: {
      dir: path.join(__dirname, 'coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'text' },
        { type: 'json-summary', file: 'coverage-summary.json' },
        { type: 'lcovonly', file: 'lcov.info' },
      ],
    },

    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
      },
    },

    client: { jasmine: { random: false } },
    // Muestra solo errores del navegador (evita ruido de avisos de React Router)
    browserConsoleLogOptions: { level: 'error', terminal: true },
    singleRun: true,
    restartOnFileChange: true,
  });
};
