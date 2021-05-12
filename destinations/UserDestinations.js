import UserDestination from './UserDestination'

export default class UserDestinations {
  constructor() {
    // Array with destination instances
    this.destinations = []
  }

  /**
   * create destination instances out of raw api data
   * @param destinations
   */
  parseApiData(destinations) {
    destinations.forEach((destination) => {
      this.destinations.push(new UserDestination(destination))
    })
  }

  /**
   * get all main / root destinations
   * @returns {Destination []}
   */
  getAllRootDestinations() {
    return this.destinations.filter((destination) => {
      return destination.getSubDestinationOf === null
    })
  }

  /**
   * search for a permission in all destinations of the user
   * @param key
   * @returns {boolean}
   */
  hasPermissionOverAllDestinations(key) {
    // iterate all destinations to look after the given permission
    for (let i = 0; i < this.destinations.length; i++) {
      // if the user has the
      if (this.destinations[i].hasUserPermissionInThisDestination(key))
        return true
    }

    // no permission was found
    return false
  }

  getDestinationsWithPermissions(key) {
    let destinationsWithPermissions = []
    for (let i = 0; i < this.destinations.length; i++) {
      if (this.destinations[i].hasUserPermissionInThisDestination(key)) {
        destinationsWithPermissions.push(this.destinations[i])
      }
    }
    return destinationsWithPermissions
  }

  getDestinationsWithAnyPermissions() {
    let destinationsWithPermissions = []
    for (let i = 0; i < this.destinations.length; i++) {
      if (this.destinations[i].hasAnyPermission())
        destinationsWithPermissions.push(this.destinations[i])
    }
    return destinationsWithPermissions
  }

  /**
   * get UserDestination instance by slug
   * @param slug
   */
  async getDestinationBySlug(slug) {
    return this.destinations.find((destination) => {
      return destination.getSlug() === slug
    })
  }

  /**
   * set first destination, which has the access rights depending on the route
   * @param route
   * @returns {Promise<PromiseConstructor>}
   */
  async setFirstDestinationAsCurrentWithRoute(route) {
    // checking for meta values in route
    if (route.meta && route.meta.requiredPermission) {
      // iterate regions
      for (let i = 0; i < this.destinations.length; i++) {
        // if we have the permission of this route in the current region, set it as default
        if (
          await this.destinations[i].hasUserPermissionInThisDestination(
            route.meta.requiredPermission
          )
        ) {
          /* global store */
          store.commit('setCurrentDestinationInstance', this.destinations[i])

          return Promise
        }
      }
    }

    return Promise
  }

  /**
   * @param destinationSlug
   * @returns {boolean}
   */
  doIHaveAnyPermissionForDestination(destinationSlug) {
    // iterate destinations
    let destination = this.destinations.find(
      (destination) => destination.getSlug() === destinationSlug
    )
    if (!destination) return false
    return destination.hasAnyPermission()
  }
}
