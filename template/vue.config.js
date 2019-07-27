const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
const resolve = (...args) => path.join(__dirname, ...args)
const {
  NODE_ENV,
  OUTPUT_DIR,
  VIEWS_PATH
} = process.env
const isProd = NODE_ENV === 'production'

<%_ if (options.modern === 'universal') { _%>
function appendHtmlWebpackOptions (args) {
  if (args.length === 0) return args
  const token = () => isProd ? '{{csrf_token()}}' : Date.now()
  args[0].token = token
  return args
}
function getPages (pages) {
  return pages.reduce((result, { name, title, phpname }) => {
    phpname = phpname || name
    const filename = isProd && process.env.VIEWS_PATH
      ? resolve(process.env.VIEWS_PATH, `${phpname}.blade.php`)
      : `${name}.html`
    result[name] = {
      entry: `src/app/${name}/main.js`,
      template: `public/${name}.html`,
      title,
      filename
    }
    return result
  }, {})
}
<%_ } _%>

module.exports = {
  outputDir: isProd && OUTPUT_DIR
    ? resolve(OUTPUT_DIR)
    : undefined,
  <%_ if (options.modern != 'universal') { _%>
  pages: {
    index: {
      entry: './src/main.js',
      template: './public/index.html',
      filename: isProd && VIEWS_PATH
        ? resolve(VIEWS_PATH, 'index.blade.php')
        : 'index.html'
    }
  },
  <%_ } else { _%>
  pages:
  getPages([
    {
      name: 'index',
      title: '前台模版',
      phpname: 'welcome'
    },
    {
      name: 'admin',
      title: '后台模版'
    }
  ]),
  <%_ } _%>
  <%_ if (options.modern === 'universal') { _%>
  chainWebpack: config => {
    // 添加变更
    config
      .plugin('html-index')
      .tap(appendHtmlWebpackOptions)
    config
      .plugin('html-admin')
      .tap(appendHtmlWebpackOptions)
    // 添加别名
    const index = './src/app/index'
    config.resolve.alias
      .set('index', resolve(index))
      .set('router', resolve(index, 'router'))
      .set('views', resolve(index, 'views'))
      .set('components', resolve('./src', 'components'))
      .set('lib', resolve('./src', 'lib'))
      .set('assets', resolve('./src', 'assets'))
  },
  <%_ } _%>
  configureWebpack: config => {
    if (isProd) {
      return {
        plugins: [
          /* gzip压缩 */
          new CompressionPlugin({
            test: /\.js$|\.html$|.\css/, // 匹配文件名
            threshold: 10240, // 对超过10k的数据压缩
            deleteOriginalAssets: false // 不删除源文件
          })
        ]
      }
    }
  },
  devServer: {
    public: 'local.data-stone.com',
    open: false,
    host: '0.0.0.0',
    disableHostCheck: true,
    proxy: {
      '/mock': {
        target: `http://127.0.0.1:3000`,
        changeOrigin: true,
        pathRewrite: {
          '^/mock': ''
        }
      },
      <%_ if (options.proxy) { _%>
      '/api': {
        target: '<%=options.proxy%>',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
      <%_ } _%>
    },
    <%_ if (options.modern === 'universal') { _%>
    historyApiFallback: {
      rewrites: [
        { from: /^\/admin/, to: '/admin.html' },
      ]
    }
    <%_ } _%>
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        resolve('./src/styles/common/index.scss')
      ]
    }
  },
  <%_ if (options.modern === 'webapp') { _%>
  css: {
    loaderOptions: {
      css: {
        // options here will be passed to css-loader
      },
      postcss: {
        // options here will be passed to postcss-loader
        plugins: [require('postcss-plugin-px2rem')({
          rootValue: 37.5,
          minPixelValue: 3
          // propBlackList:['font-size']
        })]
      }
    }
  },
  <%_ } _%>
}
