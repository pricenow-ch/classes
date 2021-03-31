export default class AdminCheckout {
  constructor(basketInstance) {
    this.basketInstance = basketInstance
  }

  /**
   * checkout for admins
   * @param paid
   * @param bookingState
   * @param uid
   * @returns {Promise<boolean>}
   */
  async checkout(paid = false, bookingStatesInstance, note, uid) {
    EventBus.$emit('spinnerShow')
    try {
      let response = await axios.post(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/checkout',
        {
          note: note,
          basketId: this.basketInstance.getUuid(),
          paid: paid,
          state: bookingStatesInstance.getBookingState().state,
          uid: uid,
        }
      )

      EventBus.$emit(
        'notify',
        i18n.t('adminCheckout.bookingCreated'),
        'success'
      )
      return response.data.bookingId
    } catch (e) {
      if (e.response.status === 472) {
        // capacity sold out in the mean time
        EventBus.$emit('notify', i18n.t('adminCheckout.capacitySoldOut'))
      } else if (e.response.status === 473) {
        EventBus.$emit('notify', i18n.t('adminCheckout.productInactive'))
      } else {
        EventBus.$emit('notify', i18n.t('adminCheckout.checkoutFailed'))
      }
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * send for example a mail confirmation
   * @param uid
   * @param subject
   * @param body
   * @returns {Promise<boolean>}
   */
  async sendMailConfirmation(uid, subject, body) {
    EventBus.$emit('spinnerShow')

    try {
      await axios.post(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/mail/send',
        {
          uid: uid,
          subject: subject,
          body: body,
        }
      )

      EventBus.$emit(
        'notify',
        i18n.t('adminCheckout.confirmationMailSent'),
        'success'
      )
      EventBus.$emit('spinnerHide')
    } catch (e) {
      EventBus.$emit('spinnerHide')
      EventBus.$emit('notify', i18n.t('adminCheckout.sendingMailFailed'))
      return false
    }
  }
}
