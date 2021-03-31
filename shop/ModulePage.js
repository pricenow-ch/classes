export default class ModulePage {
  constructor(params) {
    // step in booking process
    this.step = params.step

    // contains pageComponent instances
    this.components = []

    // helper variable to avoid the same event is listen multiple times
    this.preventParallelEventListener = 0

    this.props = params.props ? params.props : {}

    /**
     * BEFORE NEXT STEP
     */
    // function definition to check, if the current page can be skipped (see ShopModule.js => beforeNextPage())
    this.skipOnLoggedIn =
      params.beforeNextStep && params.beforeNextStep.skipOnLoggedIn
        ? params.beforeNextStep.skipOnLoggedIn
        : null

    // object with source and target booking state
    this.onNextStepSetBasketEntriesToState =
      params.beforeNextStep &&
      params.beforeNextStep.onNextStepSetBasketEntriesToState
        ? params.beforeNextStep.onNextStepSetBasketEntriesToState
        : null
    this.onPreviousStepSetBasketEntriesToState =
      params.beforePreviousStep?.onPreviousStepSetBasketEntriesToState || null

    // minimum basket entries in a particular booking state
    // can also by an array (example: basketCompletePage.js)
    this.requiredBasketEntriesInBookingState =
      params.beforeNextStep &&
      params.beforeNextStep.requiredBasketEntriesInBookingState
        ? params.beforeNextStep.requiredBasketEntriesInBookingState
        : null

    /**
     * BEFORE PREVIOUS STEP
     */
    this.resetBasketEntriesToBookingStateInProgress =
      params.beforePreviousStep &&
      params.beforePreviousStep.resetBasketEntriesToBookingStateInProgress
        ? params.beforePreviousStep.resetBasketEntriesToBookingStateInProgress
        : null
  }

  /**
   *
   * @param pageComponentInstance, Type: PageComponent
   */
  addComponent(pageComponentInstance) {
    this.components.push(pageComponentInstance)
  }

  findComponentByName(componentName) {
    return this.components.find(
      (component) => component.getName() === componentName
    )
  }

  /**
   * FORM VALIDATION
   */

  /**
   * check all forms to be completed in each component
   */
  async initAllComponentsValidation() {
    // reset all forms validity to avoid fake valid components
    await this.resetAllComponentsFormValidity()

    // iterate all components
    this.components.forEach((componentInstance) => {
      // check all forms in each component
      componentInstance.initFormValidation()
    })
  }

  /**
   * reset form validity on all components of this page
   * @returns {boolean}
   */
  resetAllComponentsFormValidity() {
    // iterate all components
    for (let i = 0; i < this.components.length; i++) {
      // reset form validity of the current component
      this.components[i].resetFormValidity()
    }

    return true
  }

  /**
   * After validateAllComponents each VueJs component is asking if it's valid.
   * @param componentId | Integer
   * @param activeModuleInstance | ShopModule
   * @param formValidationResults | Array
   */
  async validateComponentById(
    componentId,
    activeModuleInstance,
    formValidationResults
  ) {
    // check if certain component is valid

    if (
      await this.getComponentById(componentId).validateComponent(
        formValidationResults
      )
    ) {
      // all forms of the component (by id) are valid

      // check if all components are valid
      if (await this.areAllComponentsValid()) {
        // all forms of all components of this page are valid

        // if events from multiple components fire parallel, only init condition check once. If not, we are going n steps further instead of one.
        this.preventParallelEventListener++
        if (this.preventParallelEventListener <= 1) {
          activeModuleInstance.initConditionsCheck()
        }
      }
    } else {
      // the forms are invalid
      // inform user
      /* global EventBus i18n */
      EventBus.$emit('notify', i18n.t('notify.fullFillForm'), 'error', {
        uniqueIdentifier: 'formValidationBookingProcessUniqueIdentifier',
      })
    }
  }

  /**
   * checks all components of this page if forms are valid
   * @returns {boolean}
   */
  areAllComponentsValid() {
    let allComponentsAreValid = true

    // iterate components
    for (let i = 0; i < this.components.length; i++) {
      let component = this.components[i]

      if (!component.isValid()) allComponentsAreValid = false
    }

    return allComponentsAreValid
  }

  /**
   * SETTERS
   */
  resetPreventParallelEventListener() {
    this.preventParallelEventListener = 0
  }

  /**
   * GETTERS
   */

  /**
   * return
   * @returns {Array|PageComponent}
   */
  getComponents() {
    return this.components
  }

  /**
   * get component out of the class's components array
   * @param id
   * @returns {*}
   */
  getComponentById(id) {
    let component = this.components.find((component) => {
      return component.getId() === id
    })

    if (component) return component
    // todo: else console.log('Unhandled Exception: No component was found!')
  }

  getStep() {
    return this.step
  }

  canWeSkipThePage() {
    /* global store */
    return this.skipOnLoggedIn && store.getters.isUserLoggedIn()
  }

  getOnNextStepSetBasketEntriesToState() {
    return this.onNextStepSetBasketEntriesToState
  }

  getOnPreviousStepSetBasketEntriesToState() {
    return this.onPreviousStepSetBasketEntriesToState
  }

  getRequiredBasketEntriesInBookingState() {
    return this.requiredBasketEntriesInBookingState
  }

  getProps() {
    return this.props
  }
}
