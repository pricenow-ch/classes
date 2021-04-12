import { shopInstance } from '../utils/axiosInstance'
import Voucher from './Voucher'

export default class Vouchers {
  constructor() {
    // array with Voucher instances
    this.vouchers = []
  }

  /**
   * load all my vouchers from api
   * @returns {Promise<PromiseConstructor>}
   */
  async loadMyVouchers() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      const { data } = await shopInstance().get('/vouchers')

      // reset vouchers
      this.vouchers = data.map((voucher) => new Voucher(voucher))
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise
    }
  }

  /**
   * check if a particular voucher is valid
   * @param voucherInstance
   * @returns Boolean
   */
  async validateVoucher(voucherInstance) {
    /* global EventBus axios store i18n */

    // check if voucher is already in vouchers array
    if (!(await this.isVoucherInVouchers(voucherInstance))) {
      EventBus.$emit('spinnerShow')

      try {
        const response = await shopInstance().get(
          `/vouchers/${voucherInstance.getCode()}/validate`
        )

        if (response.status === 200) {
          // add voucher to array
          this.vouchers.push(new Voucher(response.data))
          return true
        } else if (response.status === 201) {
          EventBus.$emit('notify', response.data.message, 'error')
          return false
        } else {
          EventBus.$emit('notify')
          return false
        }
      } catch (e) {
        EventBus.$emit('notify', e.response)
        return false
      } finally {
        EventBus.$emit('spinnerHide')
      }
    } else {
      EventBus.$emit('notify', i18n.t('purchase.voucherAlreadyAdded'))

      return false
    }
  }

  /**
   * remove a particular voucher from the vouchers array
   * @param voucherInstance
   */
  removeVoucher(voucherInstance) {
    // iterate voucher instances
    for (let i = 0; i < this.vouchers.length; i++) {
      let tmpVoucher = this.vouchers[i]

      if (tmpVoucher.getCode() === voucherInstance.getCode()) {
        this.vouchers.splice(i, 1)
        break
      }
    }
  }

  /**
   * checks if a certain voucher is in class's Vouchers
   * @param voucherInstance
   * @returns {boolean}
   */
  isVoucherInVouchers(voucherInstance) {
    // iterate vouchers
    for (let i = 0; i < this.vouchers.length; i++) {
      let tmpVoucherInstance = this.vouchers[i]
      if (tmpVoucherInstance.getCode() === voucherInstance.getCode())
        return true
    }

    return false
  }

  /**
   * GETTERS
   */
  getVouchers() {
    return this.vouchers
  }

  /**
   * voucher code in an array
   * @returns {[]}
   */
  getVouchersAsArray() {
    let vouchersArray = []

    // iterate vouchers
    for (let i = 0; i < this.vouchers.length; i++) {
      vouchersArray.push(this.vouchers[i].getCode())
    }

    return vouchersArray
  }

  getTotalValue() {
    let sum = 0
    // iterate all vouchers
    for (let i = 0; i < this.vouchers.length; i++) {
      sum += parseFloat(this.vouchers[i].getValue())
    }

    return sum
  }
}
