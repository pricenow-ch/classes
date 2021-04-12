import axios from 'axios'
import cookies from 'js-cookie'

const peInstance = (slug = true) => {
  const instance = axios.create({
    baseURL: `${process.env.VUE_APP_PE_API_URL}${
      slug ? `/${process.env.VUE_APP_DESTINATION}` : ''
    }`,
  })
  instance.interceptors.request.use(
    function (config) {
      const token = cookies.get('authorization')
      if (token) {
        config.headers.Authorization = cookies.get('authorization')
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

const shopInstance = (slug = true) => {
  const instance = axios.create({
    baseURL: `${process.env.VUE_APP_SHOP_API_URL}${
      slug ? `/${process.env.VUE_APP_DESTINATION}` : ''
    }`,
  })
  instance.interceptors.request.use(
    function (config) {
      const token = cookies.get('authorization')
      if (token) {
        config.headers.Authorization = cookies.get('authorization')
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
