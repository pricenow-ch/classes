import axios from 'axios'
import cookies from 'js-cookie'

const peInstance = axios.create({
  baseURL: process.env.VUE_APP_PE_API_URL,
})

const shopInstance = (slug = true) =>
  axios.create({
    baseURL: `${process.env.VUE_APP_SHOP_API_URL}${
      slug ? `/${process.env.VUE_APP_DESTINATION}` : ''
    }`,
  })

peInstance.interceptors.request.use(
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
peInstance.interceptors.response.use(
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

shopInstance.interceptors.request.use(
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
shopInstance.interceptors.response.use(
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

export { peInstance, shopInstance }
