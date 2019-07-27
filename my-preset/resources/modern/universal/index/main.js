import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store'
import '@/lib/vue.axios'
import '@/styles/index.scss'
<%_ if (options.elementUI) { _%>
<%_ if (options.theme) { _%>
import '@/plugins/element.js'
<%_ } else { _%>
import ElementUI from 'element-ui'
import './theme.variables.scss'
<%_ } _%>
<%_ } _%>

import VueCookie from 'vue-cookie'
import GlobalComponentRegister from '@/plugins/register'
Vue.config.productionTip = false
Vue.use(VueCookie)
Vue.use(GlobalComponentRegister)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
