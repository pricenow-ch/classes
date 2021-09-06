import axios from 'axios'
import cookies from 'js-cookie'
import Authentication from '../../classes-shared/authentication/Authentication'

const peInstance = (slug = true) => {
  slug = slug ? store.getters.getCurrentDestinationInstance().getSlug() : ''
  const instance = axios.create({
    baseURL: `${process.env.VUE_APP_PE_API_URL}/${slug}`,
  })
  instance.interceptors.request.use(
    function (config) {
      const token = cookies.get('authorization')
      if (token) {
        config.headers.Authorization = token
      }
      return config
    },
    function (error) {
      // Do something with request error
      return Promise.reject(error)
    }
  )

  // Add a response interceptor
  instance.interceptors.response.use(
    function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response
    },
    function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return Promise.reject(error)
    }
  )
  return instance
}

const shopInstance = (hasSlug = true) => {
  const slug = hasSlug
    ? store.getters.getCurrentDestinationInstance().getSlug()
    : ''
  const instance = axios.create({
    baseURL: `${process.env.VUE_APP_SHOP_API_URL}/${slug}`,
  })
  instance.interceptors.request.use(
    function (config) {
      const token = cookies.get('authorization')
      if (token) {
        config.headers.Authorization = token
      }
      return config
    },
    function (error) {
      // Do something with request error
      return Promise.reject(error)
    }
  )

  // Add a response interceptor
  instance.interceptors.response.use(
    function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response
    },
    function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return Promise.reject(error)
    }
  )
  return instance
}

export { peInstance, shopInstance }
