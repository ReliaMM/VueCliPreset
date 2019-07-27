const fs = require('fs')

module.exports = (api, options, rootOptions) => {
  // 修改 `package.json` 里的字段
  api.extendPackage({
    dependencies: {
      axios: '^0.18.0',
      'blueimp-md5': '^2.10.0',
      dayjs: '^1.7.8',
      'vue-cookie': '^1.1.4',
      'vue-router': '^3.0.1',
      vuex: '^3.0.1'
    },
    devDependencies: {
      'compression-webpack-plugin': '^2.0.0',
      'style-resources-loader': '^1.2.1',
      'vue-cli-plugin-style-resources-loader': '^0.1.3',
      "lint-staged": "^9.2.1",
      "eslint-loader": "^2.1.2",
      "eslint-plugin-html": "^6.0.0",
      "eslint-plugin-import": "^2.18.0",
      "eslint-plugin-node": "^9.1.0",
      "eslint-plugin-promise": "^4.2.1",
      "eslint-plugin-standard": "^4.0.0",
      'eslint-config-standard': "^13.0.1",
    },
    gitHooks: {
      "pre-commit": "lint-staged"
    },
    "lint-staged": {
      "*.{js,vue}": [
        "vue-cli-service lint",
        "git add"
      ]
    }
  })
  // 自定义elementUI主题
  if (options.modern === 'webapp') {
    api.extendPackage({
      dependencies: {
        "lib-flexible": "^0.3.2",
      },
      devDependencies: {
        "postcss-loader": "^3.0.0",
        "postcss-plugin-px2rem": "^0.8.1",
        "postcss-px2rem": "^0.3.0",
      }
    })
    api.render({
      './src/App.vue': './resources/modern/webapp/index/App.vue',
      './src/main.js': './resources/modern/webapp/index/main.js',
      './src/router.js': './resources/modern/webapp/index/router.js',
    })
  }
  if (options.modern === 'universal') {
    api.render({
      './src/app/index/App.vue': './resources/modern/universal/index/app.vue',
      './src/app/index/main.js': './resources/modern/universal/index/main.js',
      './src/app/index/router.js': './resources/modern/universal/index/router.js',
      './src/app/index/views/Home.vue': './resources/modern/universal/index/views/Home.vue',

      './src/app/admin/App.vue': './resources/modern/universal/admin/app.vue',
      './src/app/admin/main.js': './resources/modern/universal/admin/main.js',
      './src/app/admin/router.js': './resources/modern/universal/admin/router.js',
      './src/app/admin/views/Home.vue': './resources/modern/universal/admin/views/Home.vue',
    })
  }
  if (options.modern === 'spa') {
    api.render({
      './src/main.js': './resources/modern/spa/main.js',
    })
  }
  // 自定义elementUI主题
  if (options.theme) {
    api.extendPackage({
      dependencies: {
        "element-ui": "^2.11.1",
      },
      scripts: {
        'theme-build': 'et',
        'theme-init': 'et --init ./src/lib/element-variables.scss'
      },
      devDependencies: {
        'babel-plugin-component': '^1.1.1',
        'element-theme': '^2.0.1',
        'element-theme-chalk': '^2.6.3'
      },
      'element-theme': {
        browsers: ['ie > 9', 'last 2 versions'],
        out: './src/theme',
        config: './src/theme-variables.scss',
        theme: 'element-theme-chalk',
        minimize: true,
        components: ['button', 'message', 'message-box']
      }
      })
      api.render({
        './src/plugins/element.js': './resources/element.ejs',
        './src/theme/README.md': './resources/theme/README.md'
      })
  }
  api.render({
    './src/theme-variables.scss': './resources/theme-variables.scss'
  })

  // 复制并用 ejs 渲染 `./template` 内所有的文件
  api.render('./template')

  api.postProcessFiles(files => {
    let template = files['public/index.html']
    if (template) {
      const lines = template.split(/\r?\n/g).reverse()
      const lastMetaIndex = lines.findIndex(line => line.trim().match(/^<meta/))
      lines[lastMetaIndex] +=
        '\n    <meta name="token" content="{{csrf_token()}}">'
      const lastTitlendex = lines.findIndex(line => line.trim().match(/^<title/))
      lines[lastTitlendex] +=
        '\n    <title><%= htmlWebpackPlugin.options.title %></title>'

      files['public/index.html'] = lines.reverse().join('\n')
    }
  })
}
