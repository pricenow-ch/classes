/**
 * holds the custom data in a basket entry to store data like selected card id or booking state
 */
import definitions from '../../../definitions'
import User from '../user/User.js'

export default class UserData {
  constructor(params) {
    this.bookingState = params.bookingState
      ? params.bookingState
      : definitions.basketBookingState.inProgress

    // 'paper' || 'swisspass' || 'skidata' || 'axess'
    this.media = params.media ? params.media : null
    this.cardId = params.hasOwnProperty('cardId') ? params.cardId : null
    this.uid = params.hasOwnProperty('uid') ? params.uid : null

    // used in the admin basket
    // Type: User
    this.user = params.user ? new User(params.user) : null

    // is this booking entry an event? Used to display the event name in the basket
    this.eventId = params.hasOwnProperty('eventId') ? params.eventId : null

    // used in the admin basket
    this.eventName = params.eventName || null

    // from which booking process was it added?
    const activeModuleId = store.getters.getActiveModuleInstance()?.getId()
    this.ownedByModuleId = params.ownedByModuleId || activeModuleId
  }

  /**
   * are the user data complete for the checkout? will only check if the booking state is "needsMedium" or "readyForCheckout"
   * @returns {boolean}
   */
  setCompleteForCheckout(basketEntry) {
    // only in the following booking states: "needsMedium" or "readyForCheckout"
    if (
      this.bookingState === definitions.basketBookingState.needsMedium ||
      this.bookingState === definitions.basketBookingState.readyForCheckout
    ) {
      if (this.media && this.uid) {
        // we've got media type and an uid
        // check if a swisspass was selected, if needed
        const swisspassAttribute = basketEntry
          .getProductDefinition()
          .getAttributes()[definitions.attributeKeys.swisspass]
        if (
          swisspassAttribute &&
          swisspassAttribute.value !==
            definitions.attributeValueContent.noSwisspass
        ) {
          const basket = store.getters.getBasketInstance()
          // swisspass selection was not done yet
          if (
            !basket
              .getBasketEntriesForReduction(definitions.attributeKeys.swisspass)
              .find((basketEntryId) => basketEntryId === basketEntry.getId())
          ) {
            if (
              !this.onlyOneReductionPossibility(
                basket,
                basketEntry,
                definitions.attributeKeys.swisspass
              )
            )
              return false
          }
        }
        // check if a tarif (eg. local or guest card) was selected, if needed
        const tarifAttribute = basketEntry
          .getProductDefinition()
          .getAttributes()[definitions.attributeKeys.tarif]
        if (tarifAttribute?.value) {
          const basket = store.getters.getBasketInstance()
          // tarif selection was not done yet
          if (
            !basket
              .getBasketEntriesForReduction(definitions.attributeKeys.tarif)
              .find((basketEntryId) => basketEntryId === basketEntry.getId())
          ) {
            if (
              !this.onlyOneReductionPossibility(
                basket,
                basketEntry,
                definitions.attributeKeys.tarif
              )
            )
              return false
          }
        }

        if (
          this.media !== definitions.ticketMedia.paper ||
          basketEntry.gaOrHalfFareRequired()
        ) {
          if (this.cardId) {
            // we've got a card id
            this.bookingState = definitions.basketBookingState.readyForCheckout
            return true
          } else {
            // we don't have any card id
            this.bookingState = definitions.basketBookingState.needsMedium
            return false
          }
        } else {
          // it's paper, no card id required
          this.bookingState = definitions.basketBookingState.readyForCheckout
          return true
        }
      } else {
        // we are missing media type or/and uid
        this.bookingState = definitions.basketBookingState.needsMedium
        return false
      }
    } else return false // no relevant booking type
  }

  /**
   * https://pricenow.atlassian.net/browse/T1-1469
   * Whenever only one reduction selection is possible, set this one automatically.
   * E.g. only GuestCard is selectable => don't make the user select the one and only possibility from the dropdown.
   * @param basket
   * @param basketEntry
   * @param type
   * @returns {boolean}
   */
  onlyOneReductionPossibility(basket, basketEntry, type) {
    const productDefinitionInstance = basketEntry.getProductDefinition()
    const productId = productDefinitionInstance.getProductId()
    const productInstance = store.getters
      .getShopModulesInstance()
      .getProductInstanceByProductId(productId)
    const productDefinitions = productInstance.filterProductDefinitionsByProductDefinitionAndAttributeKey(
      type,
      productDefinitionInstance
    )
    if (productDefinitions && productDefinitions.length <= 1) {
      basket.addBasketEntryToSelectedReductions(basketEntry.getId(), type)
      return true
    }
    return false
  }

  /**
   * SETTERS
   */

  // reset all except event params
  resetAll(basketEntry) {
    this.resetBookingState()
    this.resetMedia(basketEntry)
    this.resetCardId()
    this.resetUid()
    this.resetUser()
  }

  resetBookingState() {
    this.bookingState = definitions.basketBookingState.inProgress
  }

  resetMedia(basketEntry) {
    let availableMedia = basketEntry
      .getProductDefinitionInstance()
      .getAvailableMedias()
    if (availableMedia.length === 1) {
      this.media = availableMedia[0].value
    } else {
      this.media = basketEntry.gaOrHalfFareRequired()
        ? definitions.ticketMedia.swisspass
        : availableMedia[0].value
    }
  }

  resetCardId() {
    this.cardId = null
  }

  resetUid() {
    this.uid = null
  }

  resetUser() {
    this.user = null
  }

  setBookingState(bookingState) {
    this.bookingState = bookingState
  }

  setUid(uid) {
    this.uid = uid
  }

  setMedia(media) {
    this.media = media
  }

  setCardId(cardId) {
    this.cardId = cardId
  }

  /**
   * GETTERS
   */
  getBookingState() {
    return this.bookingState
  }

  getMedia() {
    return this.media
  }

  isSelectedMediaSwisspass() {
    return this.media === definitions.ticketMedia.swisspass
  }

  getUid() {
    return this.uid
  }

  getCardId() {
    return this.cardId
  }

  getUser() {
    return this.user
  }

  getEventName() {
    return this.eventName
  }

  getEventId() {
    return this.eventId
  }

  getOwnedByModuleId() {
    return this.ownedByModuleId
  }
}