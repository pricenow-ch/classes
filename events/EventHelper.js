import { shopInstance } from '../utils/axiosInstance'
import Events from './Events'

/**
 * This class provides some helpful methods for Events loading. This class is used to extend Products.js (=> finally used in EventProducts.js)
 * and ShopModules.js
 */
export default class EventHelper {
  constructor() {}

  // helper method to load events
  async fetchEventsFromApi(
    products,
    adminMode = false,
    showSpinner = true,
    timePeriod = 'future',
    from = null,
    to = null
  ) {
    /* global EventBus axios store */
    if (showSpinner)
      EventBus.$emit('spinnerShow', i18n.t('product.loadingEvents'))

    let url = 'events'
    if (adminMode) url = 'admin/' + url

    try {
      const { data } = await shopInstance().get(
        `${adminMode ? '/admin' : ''}/events`,
        {
          params: {
            timePeriod: timePeriod,
            from: from ? from.format('YYYY-MM-DD') : null,
            to: to ? to.format('YYYY-MM-DD') : null,
          },
        }
      )

      let eventsInstance = new Events(data)

      if (showSpinner) EventBus.$emit('spinnerHide')
      return await this.mapEventsToProducts(products, eventsInstance)
    } catch (e) {
      if (showSpinner) EventBus.$emit('spinnerHide')
      EventBus.$emit('notify', i18n.t('events.eventsCouldNotBeLoaded'))
      return false
    }
  }

  // helper method
  mapEventsToProducts(products, eventsInstance) {
    // iterate products
    for (let i = 0; i < products.length; i++) {
      let product = products[i]

      // reset events
      product.events.events = []

      // iterate events
      for (let e = 0; e < eventsInstance.events.length; e++) {
        let event = eventsInstance.events[e]

        if (product.getId() === event.productId) {
          product.events.addEvent(event)
        }
      }
    }
    return products
  }
}
