import { shopInstance } from '../utils/axiosInstance'

export default class Checkout {
  constructor() {
    this.basketInstance = store.getters.getBasketInstance()
  }

  // perform checkout
  async checkout() {
    let responseObject = {
      code: 900,
      paymentUrl: null,
      errorText: null,
    }

    // check if we have bookings which have a time constraint
    if (!(await this.basketInstance.areAllBasketEntriesInTime())) {
      responseObject.code = 901
      return responseObject
    }

    // check basket conditions
    const answer = this.basketInstance.basketConditionsMet()
    if (!answer) {
      responseObject.code = 902
      return responseObject
    }

    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      const response = await shopInstance().post('/checkout', {
        basketId: this.basketInstance.getUuid(),
        vouchers: this.basketInstance.getVouchersAsArray(),
        note: this.basketInstance.getComment(),
      })
      responseObject.code = response.status
    } catch (e) {
      responseObject.code = e.response.status
      responseObject.errorText = e.response.data.error
      responseObject.paymentUrl = e.response.data.paymentUrl
    } finally {
      EventBus.$emit('spinnerHide')
      return responseObject
    }
  }
}
