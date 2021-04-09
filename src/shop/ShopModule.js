import ModulePage from './ModulePage'
import PageComponent from './PageComponent'
import StepperHeader from './StepperHeader'
import moduleConfigurations from '../../../shopConfiguration/index.js'
import definitions from '../../../definitions'
import moment from 'moment'
import router from '@/router'

export default class ShopModule {
  constructor(params) {
    this.id = params.id

    // unique module string
    this.slug = params.slug

    // name of the shop element to display
    this.name = params.name ? params.name : null

    // fa icon to display
    this.icon = params.icon ? params.icon : null

    // first section, second section, third section
    this.section = params.section.id ? params.section.id : null

    // what is the current booking page ?
    // !!! the current page has to start with 1. if not, the booking stepper will fail. the vuetify stepper overwrites the current page to 1, so that it would always load the second page
    this.currentPage = 1

    // used to handle link params
    // Type: String
    this.currentDate = null
    // Type: Integer
    this.currentProductDefinitionId = null
    // Type: Integer
    this.currentEventId = null

    // indicates the latest navigation direction ('next' || 'previous')
    // is set on initNextStep() and initPreviousStep()
    this.currentNavigationDirection = 'next'

    // Array with product instances
    this.productsInstance = params.hasOwnProperty('products')
      ? params.products
      : null

    /**
     * defines the BOOKING PROCESS. array contains bookingPage class instances
     * @type {Array}
     */
    this.modulePages = []

    // load pages from config definition
    this.initModulePages()
  }

  /**
   * initializes the pages and components of the module
   */
  initModulePages() {
    // counter to generate unique component ids
    let componentId = parseInt(this.id + '' + 0)

    // get module definitions from config
    let destinationSlug = store.getters
      .getCurrentDestinationInstance()
      .getSlug()

    // destination too slow
    if (!destinationSlug)
      throw new Error(`Destination ${destinationSlug} not ready`)

    let moduleDefinition =
      moduleConfigurations[destinationSlug]['modules'][this.slug]

    // adding pages and components to this instance
    if (moduleDefinition && moduleDefinition.pages) {
      let pages = moduleDefinition.pages

      // iterate pages of the modules
      for (let i = 0; i < pages.length; i++) {
        let page = pages[i]
        let components = page.components

        // the first page starts at 1 !!
        let modulePageComponentInstance = new ModulePage({
          step: i + 1,
          beforeNextStep: page.beforeNextStep,
          beforePreviousStep: page.beforePreviousStep,
          props: page.props,
        })

        // iterate all components of a page
        for (let b = 0; b < components.length; b++) {
          let component = components[b]

          // unique component id
          componentId++

          // add new component to page
          modulePageComponentInstance.addComponent(
            new PageComponent(
              componentId,
              component.name,
              component.width,
              component.hasOwnProperty('background')
                ? component.background
                : null,
              this.createStepperHeaderInstance(component),
              component.props
            )
          )
        }

        this.modulePages.push(modulePageComponentInstance)
      }
    } else {
      throw new Error(
        `Module definition (${JSON.stringify(
          moduleDefinition
        )}) not found for destination ${destinationSlug} and slug ${this.slug}`
      )
    }
  }

  /**
   * create the stepper header instance out of the config file
   * @param component
   * @returns {StepperHeader}
   */
  createStepperHeaderInstance(component) {
    // any stepperHeader variable defined in the component?
    let stepperHeader = component.hasOwnProperty('stepperHeader')
      ? component.stepperHeader
      : null
    // prepare translation key variables
    const destinationSlug = store.getters
      .getCurrentDestinationInstance()
      .getSlug()
    const headerTextKey =
      'stepperHeader.' +
      destinationSlug +
      '.componentLevel.' +
      component.name +
      '.headerText'
    const headerTextModuleSpecificKey =
      'stepperHeader.' +
      destinationSlug +
      '.specificModuleComponentLevel.' +
      this.slug +
      '.' +
      component.name +
      '.headerText'
    const modalTitleKey =
      'stepperHeader.' +
      destinationSlug +
      '.componentLevel.' +
      component.name +
      '.modalTitle'
    const modalTitleModuleSpecificKey =
      'stepperHeader.' +
      destinationSlug +
      '.specificModuleComponentLevel.' +
      this.slug +
      '.' +
      component.name +
      '.modalTitle'
    const modalContentKey =
      'stepperHeader.' +
      destinationSlug +
      '.componentLevel.' +
      component.name +
      '.modalContent'
    const modalContentModuleSpecificKey =
      'stepperHeader.' +
      destinationSlug +
      '.specificModuleComponentLevel.' +
      this.slug +
      '.' +
      component.name +
      '.modalContent'

    // set default variables
    // the following fallback logic is implemented:
    // 1.) if a destination-module-component specific key is defined in the translation file, take it
    // 2.) else take the more general destination-component based translation key
    // 3.) general fallback to a destination unrelated fallback defined in the shop configuration files
    let show = true
    let headerText = i18n.te(headerTextModuleSpecificKey)
      ? i18n.t(headerTextModuleSpecificKey)
      : i18n.te(headerTextKey)
      ? i18n.t(headerTextKey)
      : null
    let modalHeaderText = i18n.te(modalTitleModuleSpecificKey)
      ? i18n.t(modalTitleModuleSpecificKey)
      : i18n.te(modalTitleKey)
      ? i18n.t(modalTitleKey)
      : null
    let modalContent = i18n.te(modalContentModuleSpecificKey)
      ? i18n.t(modalContentModuleSpecificKey)
      : i18n.te(modalContentKey)
      ? i18n.t(modalContentKey)
      : null
    let step = 1
    let infoButton = true

    // step 3 implemented here
    if (stepperHeader) {
      show = stepperHeader.hasOwnProperty('show') ? stepperHeader.show : show
      headerText = headerText || stepperHeader.headerText
      modalHeaderText = modalHeaderText || stepperHeader.modalHeaderText
      modalContent = modalContent || stepperHeader.modalContent
      step = stepperHeader.hasOwnProperty('step') ? stepperHeader.step : step
      infoButton = stepperHeader.hasOwnProperty('infoButton')
        ? stepperHeader.infoButton
        : infoButton
    }
    return new StepperHeader(
      show,
      headerText,
      modalHeaderText,
      modalContent,
      step,
      infoButton
    )
  }

  resetCurrentPage() {
    this.currentPage = 1
  }

  setCurrentPage(pageIndex) {
    this.currentPage = pageIndex
  }

  /**
   *
   * @param currentDate: String
   * @param currentProductDefinitionId: Integer
   * @param currentEventId: Integer
   * @returns {Promise<boolean>}
   */
  async setCurrentUrlQuery(
    currentDate = this.currentDate,
    currentProductDefinitionId = this.currentProductDefinitionId,
    currentEventId = this.currentEventId
  ) {
    this.currentDate = currentDate
    this.currentProductDefinitionId = currentProductDefinitionId
    this.currentEventId = currentEventId
    if (router.history.current.name === 'bookingHistory') {
      await this.updateUrlQuery(router)
    }
    return true
  }

  /**
   * NAVIGATIION
   */

  /**
   * get the current booking page instance
   * the starting page is 1 !!
   * @returns {number}
   */
  getCurrentPageInstance() {
    return this.modulePages[this.currentPage - 1]
  }

  getCurrentPage() {
    return this.currentPage
  }

  /**
   * @returns {Date}
   */
  getCurrentDateInstance() {
    if (!this.currentDate) return null
    const tmpDate = new Date(this.currentDate)
    tmpDate.setHours(0, 0, 0, 0)
    return tmpDate
  }

  getCurrentDateFormat(format = 'YYYY-MM-DD') {
    if (!this.currentDate) return null
    return moment(this.currentDate).format(format)
  }

  getCurrentProductDefinitionId() {
    return this.currentProductDefinitionId
  }

  /**
   *
   * @returns {ProductDefinition}
   */
  getCurrentProductDefinition() {
    return this.getProductDefinitionByProductDefinitionId(
      this.currentProductDefinitionId
    )
  }

  getCurrentEventId() {
    return this.currentEventId
  }

  getPreviousPageInstance(steps = 1) {
    if (this.currentPage >= steps + 1) {
      return this.modulePages[this.currentPage - (steps + 1)]
    } else {
      return null
    }
  }

  getNextPageInstance() {
    if (this.currentPage + 1 < this.modulePages.length) {
      return this.modulePages[this.currentPage]
    } else {
      return null
    }
  }

  /**
   * search for a component name and set it's page as the current one
   * @param componentName<String>
   */
  setCurrentPageByComponentName(componentName) {
    // iterate pages
    this.setCurrentPage(this.getPageByComponentName(componentName))
    return true
  }

  /**
   * search for a component name
   * @param componentName
   * @returns {boolean|number}
   */
  getPageByComponentName(componentName) {
    for (let i = 0; i < this.modulePages.length; i++) {
      let page = this.modulePages[i]
      if (
        page
          .getComponents()
          .find((component) => component.getName() === componentName)
      ) {
        return i + 1
      }
    }
    return false
  }

  /**
   * return array with bookingComponents instances
   * @returns {Array|PageComponent}
   */
  getCurrentComponents() {
    if (this.getCurrentPageInstance()) {
      return this.getCurrentPageInstance().getComponents()
    } else {
      return null
    }
  }

  /**
   * how many pages does this module have?
   * @returns {number}
   */
  pageCount() {
    return this.modulePages.length
  }

  /**
   * checks if the current page is the last page
   * @returns {boolean}
   */
  isLastPage() {
    return this.pageCount() === this.currentPage
  }

  /**
   * checks if the current page ist the first page
   * @returns {boolean}
   */
  isFirstPage() {
    return this.currentPage === 1
  }

  /**
   * if a user want to go to the next booking step, this method has to be called
   * @param formValidationResults
   * @returns {boolean | *}
   */
  async initNextStep() {
    EventBus.$emit('ShopModule:initNextStep')

    this.currentNavigationDirection = 'next'
    // test all forms in each component to be completed
    await this.getCurrentPageInstance().initAllComponentsValidation()
  }

  /**
   * this method is intended to be overwritten by child classes (it is a custom conditions checking hook)
   */
  initConditionsCheck() {
    this.beforeNextStep()
  }

  /**
   * Considers possible standard module configurations on this page.
   * E.g. that the next page will be skipped or that the basket entries change their booking state
   */
  async beforeNextStep() {
    /* global EventBus i18n */
    // emit event
    EventBus.$emit('ShopModule:BeforeNextPage')

    // short cuts
    let currentPageInstance = this.getCurrentPageInstance()
    let basketInstance = store.getters.getBasketInstance()
    let requiredBasketEntriesInBookingState = currentPageInstance.getRequiredBasketEntriesInBookingState()
    const nextPageInstance = this.getNextPageInstance()

    // check if next step is login but basket entries still in progress?
    const isNextPageShopLogin = nextPageInstance?.findComponentByName(
      'ShopLogin'
    )
    const basketEntriesInBookingState = basketInstance.hasBasketEntriesInBookingState(
      definitions.basketBookingState.inProgress
    )
    if (isNextPageShopLogin && basketEntriesInBookingState) {
      const shopModules = store.getters.getShopModulesInstance()
      if (!shopModules)
        throw new Error('Unexpected Error: ShopModules instance not available!')
      currentPageInstance.resetPreventParallelEventListener()
      shopModules.continueOpenBookingProcess()
      return
    }

    // 2. check minimal basket entries
    let basketEntries = requiredBasketEntriesInBookingState
      ? await basketInstance.getBasketEntriesInState(
          requiredBasketEntriesInBookingState
        )
      : null

    if (
      !requiredBasketEntriesInBookingState ||
      (requiredBasketEntriesInBookingState && basketEntries.length)
    ) {
      // take in account, to over jump the login page (skipFunction property in the module configuration file)
      let pagesToJump = 1

      // skip next page on condition
      if (nextPageInstance && nextPageInstance.canWeSkipThePage()) pagesToJump++

      // set all basket entries in a certain state to another state (eg. from inProgress to needsMedium)
      let stateToChange = currentPageInstance.getOnNextStepSetBasketEntriesToState()
      if (stateToChange) {
        /* global store */
        await basketInstance.updateBookingStates(
          stateToChange.sourceState,
          stateToChange.targetState
        )
      }

      // now going to the next step
      this.nextStep(pagesToJump)
    } else {
      // no basket entry inProgress booking state available
      // MANDATORY: reset prevent parallel event listener
      currentPageInstance.resetPreventParallelEventListener()

      // inform user
      EventBus.$emit(
        'notify',
        i18n.t('v5.navigationErrorNoBasketEntriesInState')
      )
      EventBus.$emit('ShopModule:NavigationError')
      EventBus.$emit('syncCurrentPageWithUrl')
    }
  }

  /**
   * intended to be overwritten by child classes
   */
  nextStep(pagesToJump = 1) {
    if (!this.isLastPage()) {
      this.currentPage += pagesToJump
      EventBus.$emit('syncCurrentPageWithUrl')
    } else {
      throw new Error('No more pages in this booking process!')
    }
  }

  /**
   * resets all parallel event listeners and resets current page to 1
   */
  resetCurrentBookingProcess() {
    // reset all parallel event listener
    this.resetAllParallelEventListeners()

    // reset basket standard product definition
    // removed as of T1-1424
    // store.getters.getBasketInstance().resetStandardProductDefinition()

    // go back to shop overview
    this.resetCurrentPage()

    return true
  }

  // helper method
  resetAllParallelEventListeners() {
    for (let i = 0; i < this.modulePages.length; i++) {
      this.modulePages[i].resetPreventParallelEventListener()
    }
  }

  /**
   * intended to be overwritten by child class
   * MANDATORY: reset the preventParallelEventListener variable on the previous page, so that's possible to navigate again.
   */
  initPreviousStep() {
    this.currentNavigationDirection = 'previous'
    // MANDATORY: reset the preventParallelEventListener variable on the previous page, so that's possible to navigate again.
    let previousPageInstance = this.getPreviousPageInstance()
    previousPageInstance.resetPreventParallelEventListener()

    // if we were able to skip previous page (eg. login), reset pre-previous page instance
    if (previousPageInstance && previousPageInstance.canWeSkipThePage()) {
      this.getPreviousPageInstance(2).resetPreventParallelEventListener()
    }

    this.initPreviousConditionsCheck()
  }

  /**
   * intended to be overwritten by child class
   */
  initPreviousConditionsCheck() {
    this.beforePreviousStep()
  }

  /**
   * Take in account the standard module configurations on this page (e.g. skip the next pages)
   * NOT intended to be overwritten
   */
  async beforePreviousStep() {
    // eventually reset basket entries to booking state 'inProgress'
    let currentPageInstance = this.getCurrentPageInstance()
    let basketInstance = store.getters.getBasketInstance()

    if (currentPageInstance.resetBasketEntriesToBookingStateInProgress)
      await basketInstance.resetBasketEntriesToBookingStateInProgress()

    let pagesToJump = 1

    // skip next page on condition
    let previousPageInstance = this.getPreviousPageInstance()
    if (previousPageInstance && previousPageInstance.canWeSkipThePage()) {
      pagesToJump++
    }

    // set all basket entries in a certain state to another state (eg. from inProgress to needsMedium)
    let stateToChange = currentPageInstance.getOnPreviousStepSetBasketEntriesToState()
    if (stateToChange) {
      /* global store */
      await basketInstance.updateBookingStates(
        stateToChange.sourceState,
        stateToChange.targetState
      )
    }

    this.previousStep(pagesToJump)
  }

  /**
   * intended to be overwritten by child class
   */
  previousStep(pagesToJump = 1) {
    if (!this.isFirstPage()) {
      this.currentPage -= pagesToJump
      EventBus.$emit('syncCurrentPageWithUrl')
    } else {
      // todo: console.log('Unhandled Exception: Previous page is not available. We already are at the first page.')
    }
  }

  /**
   * PRODUCTS
   */

  /**
   * helper function. calls the same function in the products instance of this class
   * @param key
   * @param productIds
   */
  async getProductDefinitionsByAttributeKeyAndProducts(key, productIds) {
    return this.productsInstance.getProductDefinitionsByAttributeKeyAndProducts(
      key,
      productIds
    )
  }

  getProductDefinitionByProductDefinitionId(productDefinitionId) {
    return this.productsInstance.getProductDefinitionByProductDefinitionId(
      productDefinitionId
    )
  }

  // get a particular product instance
  getProductInstanceByProductId(productId) {
    return this.productsInstance.getProductInstanceByProductId(productId)
  }

  getProductInstanceByProductDefinitionId(productDefinitionId) {
    return this.productsInstance.getProductInstanceByProductDefinitionId(
      productDefinitionId
    )
  }

  // get first product instance
  getProductInstance() {
    // in case we stored a product definition id in the url, get the product from it
    if (this.currentProductDefinitionId) {
      return this.getProductInstanceByProductDefinitionId(
        this.currentProductDefinitionId
      )
    }
    // else simply return the first product of the array
    return this.productsInstance.getFirstProduct()
  }

  // get product which has the event id
  getProductInstanceByEventId(eventId) {
    return this.productsInstance.getProductInstanceByEventId(eventId)
  }

  getEventInstanceByEventId(eventId) {
    return this.productsInstance.getEventInstanceByEventId(eventId)
  }

  /**
   * GETTERS
   */

  getId() {
    return this.id
  }

  getSlug() {
    return this.slug
  }

  getSection() {
    return this.section
  }

  getName() {
    return this.name
  }

  getIcon() {
    return this.icon
  }

  getPages() {
    return this.modulePages
  }

  getProductsInstance() {
    return this.productsInstance
  }

  getCurrentNavigationDirection() {
    return this.currentNavigationDirection
  }

  // ROUTING
  // update query params in the url
  async updateUrlQuery(router) {
    try {
      await router.replace({
        name: 'bookingHistory',
        params: {
          moduleId: router.history.current.params.moduleId,
          step: router.history.current.params.step,
        },
        query: this.createUrlQuery(),
      })
    } catch (e) {
      console.error(e)
    }
    return true
  }

  // overtake current module and current page in the base url
  async syncUrlHistoryWithCurrentPage(router) {
    try {
      await router.replace({
        name: 'bookingHistory',
        params: { moduleId: this.getId(), step: this.getCurrentPage() },
        query: this.createUrlQuery(),
      })
    } catch (e) {
      console.error(e)
    }
    return true
  }

  // push new page to url (which will trigger 'initNextStep()' in App.vue via watcher)
  async updateBookingHistory(router, newPage) {
    try {
      await router.push({
        name: 'bookingHistory',
        params: { moduleId: this.getId(), step: newPage },
        query: this.createUrlQuery(),
      })
    } catch (e) {
      await this.syncUrlHistoryWithCurrentPage(router)
    }
    return true
  }

  // helper
  createUrlQuery() {
    const query = {}
    if (this.getCurrentDateFormat()) {
      query.currentDate = this.getCurrentDateFormat()
    }
    if (this.getCurrentProductDefinitionId()) {
      query.currentProductDefinitionId = this.getCurrentProductDefinitionId()
    }
    if (this.getCurrentEventId()) {
      query.currentEventId = this.getCurrentEventId()
    }
    return query
  }
}
