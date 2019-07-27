import axios from 'axios'

const httpErrorMessage = {
  400: '请求错误',
  401: '未授权，请登录',
  403: '拒绝访问',
  404: '请求地址出错',
  408: '请求超时',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不受支持'
}

const TIMEOUT = 20 * 1e3 // 超时时间20s

const CancelToken = axios.CancelToken
const requests = {}
// 通过判断请求参数中有无cancelToken字段，去取消重复的请求
const cancelTokenHandler = ({ data, url, method }) => {
  const k = `${method}_${url}_${JSON.stringify(data)}`
  requests[k] && requests[k]()
  return new CancelToken(c => {
    requests[k] = c
  })
}

const loop = () => { }

// 超时重试次数
axios.defaults.retry = 1

// 超时重试间隔
axios.defaults.retryDelay = 500

axios.install = (Vue, { interceptors, errorHandler = loop, setLoading = loop, beforeSend }) => {
  if (interceptors) {
    axios.interceptors.request.use(config => interceptors(config, cancelTokenHandler))
  }

  axios.interceptors.response.use(
    response => {
      // 请求结束清除cancelToken
      const { url, method, data: params } = response.config
      const k = `${method}_${url}_${JSON.stringify(params)}`
      if (requests[k]) {
        delete requests[k]
      }

      // 所有接口返回数据的success字段为false时，直接reject
      const { errcode } = response.data
      if (typeof errcode === 'number' && errcode !== 0) {
        errorHandler(response)
        return Promise.reject(response.data)
      }
      return response
    },
    error => {
      if (error) {
        if (error.response) {
          const { status, config } = error.response
          const message = httpErrorMessage[status]
          error.message = status === 404 ? `${message}:${config.url}` : message
        }
      }
      /**
       * 超时重试处理
       */
      const config = error.config || {}
      const { status } = error.response || {}

      config.__retryCount = config.__retryCount || 0

      // 有重试次数且请求状态不为500时继续重试
      const needRetry = config.retry > 0 && config.__retryCount < config.retry && status !== 500

      if (needRetry) {
        config.__retryCount++
        return new Promise((resolve) => {
          setTimeout(resolve, config.retryDelay || 1)
        }).then(() => axios({ ...config, baseURL: '' }))
      }
      errorHandler(error)
      return Promise.reject(error)
    }
  )

  if (process.env.NODE_ENV !== 'production') {
    axios.defaults.baseURL =
      process.env.VUE_APP_MOCK === 'mock'
        ? process.env.VUE_APP_MOCK_URL || '/mock'
        : process.env.VUE_APP_BASE_URL || '/api'
  }

  axios.defaults.withCredentials = true

  axios.defaults.timeout = TIMEOUT

  // 包装方法，统一添加loading状态
  const handleWrap = async (handle, opt = {}) => {
    const { url, params = {}, options = {} } = opt
    const { loading, ..._options } = options
    // 开启loading
    setLoading(loading, true)
    if (beforeSend) {
      await beforeSend(opt)
    }
    // 移除参数中的空值
    const _params = {}
    for (const k in params) {
      const value = params[k]
      if (value === '' || value === null) continue
      _params[k] = value
    }
    return handle(url, _params, _options).finally(() => setLoading(loading, false))
  }

  // 包装get方法，使其参数传递方式与post请求一致
  const axiosGet = axios.get
  axios.get = (url, params, options) =>
    handleWrap((url, params, opt) => axiosGet(url, { params, ...opt }), {
      url,
      params,
      options
    })

  // 包装post方法, 添加loading状态
  const axiosPost = axios.post
  axios.post = (url, params, options) =>
    handleWrap(axiosPost, {
      url,
      params,
      options
    })

  Vue.prototype.$http = Vue.prototype.axios = axios
}

export default axios
