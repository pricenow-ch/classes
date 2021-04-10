import Products from '../products/Products'
import ShopModule from './ShopModule'
import definitions from '../../../../src/definitions'
import EventHelper from '../events/EventHelper'
import EventsModule from './modules/events/EventsModule'
import Events from '../events/Events'

export default class ShopModules extends EventHelper {
  constructor() {
    super()
    // array with shop elements
    this.shopModules = []
    // the active shop module (e.g. skiticket)
    this.activeShopModule = null
  }

  /**
   * load all shop elements from api
   */
  async loadShopModules() {
    /* global axios EventBus store */
    try {
      let response = await axios.get(
        store.getters.getCurrentDestinationInstance().getShopApi() + 'modules'
      )

      if (response.status === 200) {
        // parse api data
        await this.parseApiData(response.data)
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      // do not emit error, if shop is closed
      if (!this.$store.getters.isShopOffline())
        EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
      // set the default shop module id
      this.activeShopModule = this.shopModules[0].getId()
      return Promise.resolve(true)
    }
  }

  /**
   * creates data structure out of raw api data
   * @param modules
   * @returns {Promise<PromiseConstructor>}
   */
  async parseApiData(modules) {
    // iterate all modules
    for (let i = 0; i < modules.length; i++) {
      let module = modules[i]
      let moduleId = i + 1

      // prepare products
      let productsInstance = new Products()
      // only parse products, if there are any
      if (module.hasOwnProperty('products') && module.products.length)
        await productsInstance.parseApiData(module.products)

      // IMPORTANT: THE ID OF A SHOPMODULE INSTANCE HAS TO BE i +1 !! (because of getActiveModule() in this class => id are compared)
      // decide which ShopModule child class should be loaded
      if (module.slug.startsWith('event')) {
        // all event modules
        this.shopModules.push(
          new EventsModule({
            id: moduleId,
            slug: module.slug,
            section: module.section,
            icon: module.icon,
            products: productsInstance,
          })
        )
      } else {
        // fallback, standard
        this.shopModules.push(
          new ShopModule({
            id: moduleId,
            slug: module.slug,
            section: module.section,
            icon: module.icon,
            products: productsInstance,
          })
        )
      }
    }

    // sort shop modules
    this.shopModules.sort((a, b) => {
      return (
        a.getProductInstance().getSortOrder() -
        b.getProductInstance().getSortOrder()
      )
    })
    return Promise.resolve(this.shopModules)
  }

  /**
   * EVENTS
   */

  /**
   * loading all events of all EventsModule.js
   */
  async loadEvents() {
    // 1.) get all eventTemplate products
    let eventModules = this.getModulesOfInstance(EventsModule)

    let products = []
    for (let i = 0; i < eventModules.length; i++) {
      let eventModule = eventModules[i]
      products.push(eventModule.getProductsInstance().getFirstProduct())
    }

    // 2.) load events with the help of the eventHelper.js methods
    products = await this.fetchEventsFromApi(products, false, false)
    return products
  }

  // helper method
  getModulesOfInstance(type) {
    return this.shopModules.filter((module) => module instanceof type)
  }

  /**
   * returns an Events.js instance of all events from all EventsModule.js
   */
  getEventsInstance() {
    let eventModules = this.getModulesOfInstance(EventsModule)
    let eventsInstance = new Events()

    for (let i = 0; i < eventModules.length; i++) {
      let events = eventModules[i].getProductsInstance().getFirstProduct()
        .events.events

      for (let event in events) {
        eventsInstance.addEvent(events[event])
      }
    }

    // sort events by date
    eventsInstance.sortEvents()

    return eventsInstance
  }

  /**
   * search for the wrapper product of the event
   * @param eventId
   * @returns {null|*}
   */
  getEventInstanceByEventId(eventId) {
    // get events modules
    let modules = this.getModulesOfInstance(EventsModule)

    for (let i = 0; i < modules.length; i++) {
      let eventModule = modules[i]
      let event = eventModule.getEventInstanceByEventId(eventId)

      if (event) return event
    }

    return null
  }

  /**
   * is this id the active module
   * @param moduleId
   * @returns {boolean}
   */
  isActiveModule(moduleId) {
    return this.activeShopModule === moduleId
  }

  /**
   * SETTERS
   */

  /**
   * change module id
   * @param moduleId
   */
  setActiveModule(moduleId) {
    this.activeShopModule = moduleId
  }

  /**
   * GETTERS
   */

  /**
   * returns all shop elements with a particular section
   * @param section
   * @returns {*}
   */
  getShopModuleBySection(section, onlyActive = false) {
    let modules = this.shopModules.filter((module) => {
      return (
        module.getSection() === section &&
        ((onlyActive && module.getProductInstance().isActive()) || !onlyActive)
      )
    })
    // sort by product's sort order
    return modules.sort((a, b) => {
      return (
        a.getProductInstance().getSortOrder() -
        b.getProductInstance().getSortOrder()
      )
    })
  }

  /**
   * returns the active shopModule instance
   * @returns {null|ShopModule}
   */
  getActiveModule() {
    if (this.shopModules.length) {
      return this.shopModules.find((module) => {
        return module.getId() === this.activeShopModule
      })
    } else {
      return null
    }
  }

  /**
   * Returns an pseudo active ShopModule instance. Guarantees that a module of the respective section id is always active
   * @param sectionId
   * @returns {null|ShopModule|*}
   */
  getActiveModuleBySectionId(sectionId) {
    const sectionModules = this.getShopModuleBySection(sectionId)
    const activeModule = this.getActiveModule()

    // is one of the modules of this section active?
    if (
      sectionModules.find(
        (sectionModule) => sectionModule.getId() === activeModule.getId()
      )
    ) {
      return activeModule
    } else {
      // just return section's first module
      if (!sectionModules.length)
        throw new Error('No section modules available in ShortCutSection.vue!')
      return sectionModules[0]
    }
  }

  /**
   * Get the module instance which has a product, which has the event
   * @param eventId
   * @returns {*}
   */
  getModuleInstanceIncludesEventId(eventId) {
    let eventShopModules = this.getModulesOfInstance(EventsModule)

    // iterate modules
    for (let i = 0; i < eventShopModules.length; i++) {
      let eventModule = eventShopModules[i]
      if (eventModule.getProductInstanceByEventId(eventId)) return eventModule
    }

    throw new Error('No module found by event id!')
  }

  /**
   * Search for a particular shop module which contains the passed product id
   * @param productId
   * @returns {Promise<null|*>}
   */
  getFirstModuleInstanceIncludesProductId(productId) {
    // iterate shop modules
    for (let i = 0; i < this.shopModules.length; i++) {
      let shopModule = this.shopModules[i]
      if (shopModule.getProductInstanceByProductId(productId)) return shopModule
    }
    return null
  }

  getProductInstanceByProductId(productId) {
    let shopModule = this.getFirstModuleInstanceIncludesProductId(productId)
    if (shopModule) return shopModule.getProductInstanceByProductId(productId)
    return null
  }

  /**
   * Todo: Move to basket Vue component
   * Basket helper
   */
  async goToCheckout(router) {
    // 1. no basket entries at all => go back to booking process
    let basket = store.getters.getBasketInstance()
    let basketEntries = basket.getBasketEntries()
    if (basketEntries.length === 0) {
      await this.goToShopHome(router)
      return
    }

    // 2. do we have an active module?
    let activeModule = this.getActiveModule()
    if (!activeModule) {
      // get an active module first
      for (let i = 0; i < this.basketEntries.length; i++) {
        activeModule = this.getFirstModuleInstanceIncludesProductId(
          this.basketEntries[i].getProductDefinition().getProductId()
        )
        if (activeModule) break
      }
    }

    // 3. reset parallel event listener
    activeModule.resetAllParallelEventListeners()

    // 4. Booking entries in progress ?
    const hasBasketEntriesInProgress = basket.hasBasketEntriesInBookingState(
      definitions.basketBookingState.inProgress
    )
    if (hasBasketEntriesInProgress) {
      this.continueOpenBookingProcess()
      return
    }

    // 5. set next step before login
    const loginPageId = activeModule.getPageByComponentName('ShopLogin')
    // unexpected error
    if (loginPageId <= 1) throw new Error('Unexpected error: Page id too low!')
    activeModule.setCurrentPage(loginPageId - 1)

    // 6. init next step
    await activeModule.updateBookingHistory(
      router,
      activeModule.getCurrentPage()
    )
    EventBus.$emit('initNextStep')
  }

  /**
   * Todo: move to App.vue
   * Restart the booking process
   */
  async goToShopHome(router) {
    // 1. reset current booking process if any
    let activeModule = this.getActiveModule()
    if (activeModule) {
      activeModule.resetCurrentBookingProcess()
    } else {
      // no active module.
      this.setActiveModule(this.shopModules[0])
      activeModule = this.getActiveModule()
      activeModule.resetCurrentBookingProcess()
    }
    EventBus.$emit('syncCurrentPageWithUrl')

    // 2. set url
    return await activeModule.updateBookingHistory(
      router,
      activeModule.getCurrentPage()
    )
  }

  /**
   * Go back to the booking process where we have basket entries in progress.
   */
  continueOpenBookingProcess() {
    const basketInstance = store.getters.getBasketInstance()
    const firstBookingEntryInProgress = basketInstance.getFirstBasketEntryInBookingState(
      definitions.basketBookingState.inProgress
    )
    const firstModuleIncludesProductId = this.getFirstModuleInstanceIncludesProductId(
      firstBookingEntryInProgress.getProductDefinition().getProductId()
    )
    // health check. shouldn't appear.
    if (!firstModuleIncludesProductId)
      throw new Error('No fitting module found!')
    EventBus.$emit('notify', i18n.t('v5.basketInProgress'))
    EventBus.$emit('goToModuleStep', firstModuleIncludesProductId.getId(), 2)
  }
}
