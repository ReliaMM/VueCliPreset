import Vue from 'vue'
import axios from '@/lib/axios'
import store from '@/store'
import { Message, MessageBox } from 'element-ui'
import { UPDATE_TOKEN } from '@/store/mutation-types'
const exclude = []
Vue.use(axios, {
  beforeSend ({ url, options = {} }) {
    // 禁止Message提示
    if (options.noMessage && !exclude.includes(url)) {
      exclude.push(url)
    }
    if (url === '/index') return
    const token = store.state.token || ''

    if (process.env.NODE_ENV !== 'production' && token && token.includes('csrf_token')) {
      return store.dispatch(UPDATE_TOKEN)
    }
    if (!store.state.token) return store.dispatch(UPDATE_TOKEN)
  },
  interceptors: (config, cancelToken) => {
    config.cancelToken = cancelToken(config)
    config.headers['X-CSRF-TOKEN'] = store.state.token
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    return config
  },
  setLoading (key, value) {
    if (key) {
      store.commit('SET_LOADING', { [key]: value })
    }
  },
  errorHandler (error) {
    if (!error) return
    const { config = {}, data = {}, response = {} } = error
    if (response.status === 419) {
      MessageBox.alert('登录已过期，点击确认刷新', '提示').then(() => {
        window.location.reload()
      })
    }
    if (config.url && exclude.includes(config.url.replace(config.baseURL || '', ''))) return
    Message({
      type: 'error',
      message: data.message || error.message
    })
  }
})

export default axios
