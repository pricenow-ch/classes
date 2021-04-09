export default class FormRequest {
  constructor(basket, subject) {
    this.basketInstance = basket
    this.subject = subject
  }

  async sendMessage() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      await axios.post(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'contact/send',
        {
          subject: this.subject,
          body: this.basketInstance.getComment(),
        }
      )

      // reset message
      this.basketInstance.comment = null

      EventBus.$emit('notify', i18n.t('formRequest.requestSent'), 'success')

      // reset booking process
      await store.dispatch('resetBookingProcess')
      return true
    } catch (e) {
      EventBus.$emit('notify', i18n.t('formRequest.sendingFailed'))
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }
}
