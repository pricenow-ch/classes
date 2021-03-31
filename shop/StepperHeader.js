/**
 * stores the setting for the header in the shop stepper
 */

export default class StepperHeader {
  constructor(
    show,
    headerText,
    modalHeaderText,
    modalContent,
    step,
    infoButton
  ) {
    // display any header?
    this._show = show

    // text to be displayed in the header
    this.headerText = headerText

    // text in the modal, when info button clicked
    this.modalHeaderText = modalHeaderText

    // content in the modal as html
    this.modalContent = modalContent

    // step (number), to display corresponding info number in the header
    this.step = step

    // info button which can be clicked for more information
    this.infoButton = infoButton
  }

  /**
   * GETTERS
   */
  getHeaderText() {
    return this.headerText
  }

  getModalHeaderText() {
    return this.modalHeaderText
  }

  getModalContent() {
    return this.modalContent
  }

  getStep() {
    return this.step
  }

  getInfoButton() {
    return this.infoButton
  }

  show() {
    return this._show
  }
}
