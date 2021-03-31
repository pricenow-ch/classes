export default class PageComponent {
  constructor(id, name, width, background, stepperHeaderInstance, props = []) {
    // unique component instance id. A page can contain multiple components, even the same component multiple times. But each component instance has a unique id.
    // the unique id is used to talk with specific vuejs component. In other words: each vuejs component can be related with exactly one PageComponent instance.
    this.id = id

    // unique identifier string for the component
    this.name = name

    // width from 1 to 12
    this.width = width

    // css background class. By default it's white
    this.background = background ? background : 'white'

    // configuration of the header in this component (e.g. header title, info text etc.)
    this.stepperHeaderInstance = stepperHeaderInstance

    // props to pass to the related vue component. these props are defined in the config file of the shop
    // see readme for further information
    this.props = props

    // boolean to save the form validation state
    // before going to the next booking step: testing if this boolean is true
    this.allFormsAreValid = false
  }

  /**
   * FORM VALIDATION
   */

  /**
   * start the validate process
   */
  initFormValidation() {
    /* global EventBus */
    EventBus.$emit(this.name + ':validate', this.id)
  }

  /**
   * Set all Forms invalid
   */
  resetFormValidity() {
    // reset form validity
    this.allFormsAreValid = false

    return !this.allFormsAreValid
  }

  /**
   * are all forms of this component valid? if so, set the allFormsAreValid variable to true
   * @param formValidationResults | Array
   * @returns {boolean}
   */
  validateComponent(formValidationResults = []) {
    // check if all forms are valid
    let incompleteForms = formValidationResults.some((result) => {
      return result === false
    })

    if (incompleteForms) return false
    else {
      // all forms are valid
      this.allFormsAreValid = true
      return true
    }
  }

  /**
   * GETTERS
   */

  getId() {
    return this.id
  }

  /**
   * returns vuetify compatible width class
   */
  getWidth(isSmAndUpBreakpoint) {
    return isSmAndUpBreakpoint ? 'col-' + this.width : 'col-12'
  }

  getBackground() {
    return this.background
  }

  getName() {
    return this.name
  }

  isValid() {
    return this.allFormsAreValid
  }

  getStepperHeaderInstance() {
    return this.stepperHeaderInstance
  }

  getProps() {
    return this.props
  }
}
