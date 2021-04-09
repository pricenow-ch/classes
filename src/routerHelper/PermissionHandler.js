export default class PermissionHandler {
  /**
   * main method to check, if the user has appropriate access rights for the current route
   * @param meta
   * @returns {boolean}
   */
  static hasPermission(meta) {
    // 1.) route does not need any login nor are permissions required and default destination is allowed. grant access fast
    if (
      !meta?.loginRequired &&
      !meta?.requiredPermission &&
      meta?.defaultDestinationAllowed
    ) {
      // performance
      return true
    }

    // 2.) check, if simple login is required (without any permission) but not given? E.g. for my profiles or similar
    if (meta && meta.loginRequired && !store.getters.isUserLoggedIn()) {
      return false
    }

    // 3.) check if permissions are required on the route and check if available
    const appDestination = store.getters.getAppDestinationInstance()
    if (appDestination) {
      // check for the default destination
      if (appDestination.isDefaultDestination()) {
        // we are in the default destination mode
        return this.checkDefaultDestination(meta) // access granted
      } else {
        // we have a normal destination with shop
        return this.checkPermissionInCurrentDestination(meta)
      }
    } else {
      // should not happen => this is caught in main.js
      throw new Error('App Destination not available!')
    }
  }

  /**
   * helper method
   * check, if in default destination mode we can access this route and check routing permission
   * @param meta
   * @returns {boolean}
   */
  static checkDefaultDestination(meta) {
    // is this routing allowed for default destination mode? => needs config.permission.FRONTEND_ACCESS_PE_OVERVIEW
    // also the user has to be logged in => if not: we don't have any appUserInstance in the store
    /* global store */
    if (meta && meta.defaultDestinationAllowed) {
      const appUser = store.getters.getAppUserInstance()
      if (meta.requiredPermission) {
        if (!appUser) return false
        // check if user has a region with required route permission
        return appUser.doIHavePermissionOverAllDestinationsForKey(
          meta.requiredPermission
        ) // user has required permission in one of his related regions: access granted
      }
      return true // routing is allowed for default destination and no permission is required: access granted
    }
    return false // not allowed in default destination: access denied
  }

  /**
   * helper method
   * does the current route has any permission. and if so: Do I have the required access rights with the current destination ?
   * @param meta
   * @returns {boolean|*}
   */
  static checkPermissionInCurrentDestination(meta) {
    /* global store */
    // are permission required ?
    if (meta && meta.requiredPermission) {
      const appuserInstance = store.getters.getAppUserInstance()

      // check AppUser is ready
      if (appuserInstance) {
        // do I have the required permission in my current destination
        return appuserInstance.doIHavePermissionInTheCurrentDestinationForKey(
          meta.requiredPermission
        )
      } else {
        // AppUser is not ready! Throw an error
        throw new Error('Unexpected error: AppUser is not ready!')
      }
    }
    return true // no required permission: access granted
  }
}
