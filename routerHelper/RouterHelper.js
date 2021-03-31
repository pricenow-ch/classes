/**
 * provides some methods for the routes.
 * divides routes into different routing sections: backend (backend pe and backend shop) and user profile routes (where login is required)
 */
import PermissionHandler from './PermissionHandler'
import store from '@/store/store'
export default class RouterHelper {
  constructor($router) {
    this.$router = $router

    // backend
    this.backendBaseUrl = '/backend/'
    this.backendPeUrl = this.backendBaseUrl + 'pricing/'
    this.backenShopUrl = this.backendBaseUrl + 'shop/'

    // user profile routes
    this.userProfileBaseUrl = '/user/'
  }

  /**
   * get all routes as js objects
   * @returns {default.computed.routes|RouteConfig[]}
   */
  async getRoutes(
    checkForPermission = true,
    withLock = false,
    checkMenuExclusions = false
  ) {
    if (checkForPermission) {
      let routes = this.$router.options.routes
      let foundRoutes = []

      // filter the routes
      for (let i = 0; i < routes.length; i++) {
        let route = routes[i]
        if (await PermissionHandler.hasPermission(route.meta)) {
          if (route.meta) route.meta.onlyGrantedAccessForLockIcon = false
          foundRoutes.push(route)
        }
        // but does the route has the withLock attribute?
        else if (withLock && route.meta && route.meta.withLock) {
          if (route.meta) route.meta.onlyGrantedAccessForLockIcon = true
          foundRoutes.push(route)
        }
      }

      // fix scheurer, 09.12.2019 => using foundRoutes.pop() isn't save!
      if (checkMenuExclusions) {
        foundRoutes = foundRoutes.filter((tmpRoute) => {
          if (tmpRoute?.meta?.excludeFromNavigation) {
            return false
          }
          if (
            tmpRoute?.meta?.excludeFromNavigationIfStaticPriced &&
            store.getters.isOnlyStaticallyPriced
          ) {
            return !store.getters.isOnlyStaticallyPriced()
          }
          return true
        })
      }

      return foundRoutes
    } else return this.$router.options.routes
  }

  /**
   * BACKEND ROUTES
   */

  /**
   * all route objects starting with '/backend/pricing/'
   * @returns {T[]}
   */
  async getBackendPeRoutes(
    checkForPermission = true,
    withLock = false,
    checkMenuExclusions = false
  ) {
    let routes = await this.getRoutes(
      checkForPermission,
      withLock,
      checkMenuExclusions
    )
    return routes.filter((route) => {
      return route.path.startsWith(this.backendPeUrl)
    })
  }

  /**
   * all route objects starting with '/backend/shop/'
   * @returns {T[]}
   */
  async getBackendShopRoutes(
    checkForPermission = true,
    withLock = false,
    checkMenuExclusions = false
  ) {
    let routes = await this.getRoutes(
      checkForPermission,
      withLock,
      checkMenuExclusions
    )
    return routes.filter((route) => {
      return route.path.startsWith(this.backenShopUrl)
    })
  }

  /**
   * USER PROFILE ROUTES
   */
  async getAllUserProfileRoutes(checkForPermission = true) {
    let routes = await this.getRoutes(checkForPermission)
    return routes.filter((route) => {
      return route.path.startsWith(this.userProfileBaseUrl)
    })
  }

  /**
   * check if the current route is in backend
   */
  async isBackend() {
    let backendRoutes = await this.getAllBackendRoutes(false)

    // filter the backend routes
    return (
      backendRoutes.find((route) => {
        return route.name === this.$router.currentRoute.name
      }) !== undefined
    )
  }

  /**
   * all route objects of the backend => helper of isBackend ()
   */
  async getAllBackendRoutes(checkForPermission = true) {
    // get routes
    // ATTENTION: we have to get the routes individually before filtering them, to make use of the await keyword.
    let routes = await this.getRoutes(checkForPermission)

    // filter routes
    return routes.filter((route) => {
      return route.path.startsWith(this.backendBaseUrl)
    })
  }

  /**
   * getting all backend routes, where I have access to
   * @returns {Promise<null|*>}
   */
  async getFirstBackendRouteWhereUserHasPermissionFor() {
    let shopRoutes = await this.getFirstBackendShopRouteWhereuserHasPermissionFor()
    let peRoutes = await this.getFirstBackendPeRouteWhereUserHasPermissionFor()

    if (shopRoutes || peRoutes) {
      /* global store */
      // set current destination, if default destination is the current
      // fix 20.09.2019 by Michael Scheurer: Always set first destination as the current. Why?
      // If user logs in with a Verbier-Account, logs out and re-logs in with a Bellwald-Account, the current destination
      // has to be updated in the function setFirstDestinationAsCurrentWithRoute()
      await store.getters
        .getAppUserInstance()
        .getUserDestinationsInstance()
        .setFirstDestinationAsCurrentWithRoute(shopRoutes || peRoutes)

      return shopRoutes || peRoutes
    }
    return null
  }

  async getFirstBackendPeRouteWhereUserHasPermissionFor() {
    let foundRoutes = await this.getBackendPeRoutes(true, false, true)
    if (foundRoutes.length) return foundRoutes[0]
    return null
  }

  async getFirstBackendShopRouteWhereuserHasPermissionFor() {
    let foundRoutes = await this.getBackendShopRoutes(true, false, true)
    if (foundRoutes.length) return foundRoutes[0]
    return null
  }

  /**
   * GETTERS
   */

  /**
   * general backend url
   * @returns {string}
   */
  getBackendBaseUrl() {
    return this.backendBaseUrl
  }

  getBackendPeUrl() {
    return this.backendPeUrl
  }

  getBackendShopUrl() {
    return this.backenShopUrl
  }
}
