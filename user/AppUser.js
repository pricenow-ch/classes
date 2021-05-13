import User from './User'
import UserDestinations from '../destinations/UserDestinations'
import Card from '../Card'
import UserBookings from '../bookings/UserBookings'
import { shopInstance } from '../utils/axiosInstance'
import definitions from '../../../definitions'

/**
 * containing all extra information about the logged in user such as regions etc.
 */

export default class AppUser extends User {
  constructor(params, destinations, cards) {
    super(params)

    // loading cards
    if (cards) this.parseApiCardData(cards)
    if (params.productDefinitionFavorites) {
      store.commit(
        'UserProductDefinitionBookmarks/setBookmarks',
        JSON.parse(params.productDefinitionFavorites)
      )
    }

    // What destinations with what user levels
    this.userDestinationsInstance = null

    // user instances
    this.shadowUserInstances = []

    this.initDestinations(destinations)
  }

  /**
   * @override parent method because data is returning different from api than shadow user data
   * @param apiCards
   */
  parseApiCardData(apiCards) {
    // iterate all cards
    for (let i = 0; i < apiCards.length; i++) {
      let card = apiCards[i]
      card.cardDescription = card.users2skiCard.cardDescription
      this.cards.push(new Card(card))
    }
  }

  async loadShadowUsers() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      const { data } = await shopInstance().get('/linkedProfiles/true')

      this.shadowUserInstances = data
        .filter((d) => !!d.user)
        .map((shadowUser) => new User(shadowUser.user))
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise
    }
  }

  /**
   * Delete my profile
   */
  async deactivateMyProfile() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      await shopInstance().delete('/user/self')
      return Promise.resolve(true)
    } catch (e) {
      EventBus.$emit('notify', e.response)
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * initialize UserDestinations instance
   * @param destinations
   */
  initDestinations(destinations) {
    let userDestinationsInstance = new UserDestinations()
    userDestinationsInstance.parseApiData(destinations)
    this.userDestinationsInstance = userDestinationsInstance
  }

  /**
   * do I have the required permissions over all destinations ?
   * @returns {boolean}
   */
  doIHavePermissionOverAllDestinationsForKey(key) {
    if (!this.userDestinationsInstance) {
      return false
    }
    return this.userDestinationsInstance.hasPermissionOverAllDestinations(key)
  }

  /**
   * check for a particular permission in the current destination
   * @param key
   */
  async doIHavePermissionInTheCurrentDestinationForKey(key) {
    const currentDestination = await this.getCurrentUserDestinationInstance()
    return currentDestination.hasUserPermissionInThisDestination(key)
  }

  /**
   * @param destinationSlug
   * @returns {boolean}
   */
  doIHaveAnyPermissionForDestination(destinationSlug) {
    return this.userDestinationsInstance.doIHaveAnyPermissionForDestination(
      destinationSlug
    )
  }

  /**
   * Can I switch to the pricing admin
   * @returns {boolean}
   */
  async doIHavePermissionForPricingDashboard() {
    // if you have one of these permissions, you can enter the pricing dashboard
    const permissionsAllowForPricingDashboard = [
      definitions.permissions.frontend.FRONTEND_ACCESS_PE_OVERVIEW,
      definitions.permissions.frontend.FRONTEND_ACCESS_PE_DETAILS,
      definitions.permissions.frontend.FRONTEND_ACCESS_PE_ANALYTICS,
    ]
    for (let i = 0; i < permissionsAllowForPricingDashboard.length; i++) {
      const permission = permissionsAllowForPricingDashboard[i]
      if (
        await this.doIHavePermissionInTheCurrentDestinationForKey(permission)
      ) {
        return true
      }
    }
    return false
  }

  /**
   * the user destination, which is the current destination from the store
   */
  getCurrentUserDestinationInstance() {
    /* global store */
    return this.userDestinationsInstance.getDestinationBySlug(
      store.getters.getCurrentDestinationInstance().getSlug()
    )
  }

  /**
   * mandatory fields for checkout
   * @returns {*}
   */
  userFieldsComplete() {
    if (this.phoneRequired()) {
      if (!this.getPhone()) return false
    }

    return (
      this.getFirstName() &&
      this.getLastName() &&
      this.getAddress() &&
      this.getZip() &&
      this.getCity() &&
      this.getCountry()
    )
  }

  // if it's a Niesen table reservation, the phone is required
  phoneRequired() {
    let basket = store.getters.getBasketInstance()
    return basket
      .getBasketEntries()
      .find(
        (entry) =>
          entry.getProductDefinition().getProductInstance().getName() ===
          'tableReservation'
      )
  }

  // casts the type to UserBookings.js
  castToUserBookings() {
    this.surname = this.lastName
    this.street = this.address
    this.bookings = []

    let userBookings = new UserBookings(this)
    userBookings.setShadowUsers(this.shadowUserInstances)

    return userBookings
  }

  /**
   * GETTERS
   */
  // all shadow users including me
  getAllUsers() {
    return [this, ...this.shadowUserInstances]
  }

  getUserById(userId) {
    // iterate all users (shadow users and me)
    let users = this.getAllUsers()
    for (let i = 0; i < users.length; i++) {
      let user = users[i]
      if (user.getId() === userId) return user
    }

    // nothing found
    return null
  }

  getUserDestinationsInstance() {
    return this.userDestinationsInstance
  }

  getShadowUserInstances() {
    return this.shadowUserInstances
  }
}
