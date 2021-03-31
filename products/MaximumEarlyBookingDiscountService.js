import store from '../../store/store'
import moment from 'moment'
import MaximumEarlyBookingDiscount from '@/classes/products/MaximumEarlyBookingDiscount'

export default class MaximumEarlyBookingDiscountService {
  /**
   * load max booking discounts in range
   * for given product definitions
   * @param from
   * @param to
   * @param productDefinitionIds
   * @param destinationInstance
   * @returns {Promise<[]>}
   */
  async fetchBetween(
    from = new Date(),
    to = new Date(),
    productDefinitionIds = []
  ) {
    let baseUrl = store.getters.getCurrentDestinationInstance().getBasePeApi()
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let maxEarlyBookingDiscounts = []
    try {
      let params = {
        from: moment(from).format('YYYY-MM-DD'),
        to: moment(to).format('YYYY-MM-DD'),
        prodDefIds: productDefinitionIds.join(','),
      }
      if (store.getters.isActivePricingModel('winter_3')) {
        params['priceModel'] = 'winter_3'
      }

      let response = await axios.get(
        baseUrl + 'admin/max_early_booking_discount',
        {
          params,
        }
      )

      if (response.status === 200) {
        response.data.forEach((earlyBooking) => {
          maxEarlyBookingDiscounts.push(
            new MaximumEarlyBookingDiscount(earlyBooking)
          )
        })
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }

    return maxEarlyBookingDiscounts
  }

  /**
   * set a new max early booking discount
   * @param maxEarlyBookingObj
   * @param newDiscountFactor
   * @returns {Promise<void>}
   */
  async overwrite(maxEarlyBookingObj, newDiscountFactor) {
    if (maxEarlyBookingObj.hasCustomEarlyBookingDiscount()) {
      await this.updateMaxEarlyBookingDiscount(
        maxEarlyBookingObj,
        newDiscountFactor
      )
    } else {
      await this.createMaxEarlyBookingDiscount(
        maxEarlyBookingObj,
        newDiscountFactor
      )
    }
  }

  /**
   * create a max early booking discount
   * @param maxEarlyBookingObjs
   * @param newDiscountFactor
   * @returns {Promise<void>}
   */
  async createMaxEarlyBookingDiscount(maxEarlyBookingObjs, newDiscountFactor) {
    let baseUrl = store.getters.getCurrentDestinationInstance().getBasePeApi()
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      await axios.post(baseUrl + 'admin/max_early_booking_discount', {
        date: maxEarlyBookingObjs.date,
        productdefinitionid: maxEarlyBookingObjs.productDefinitionId,
        factor: newDiscountFactor,
      })
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * update a max early booking discount
   * @param maxEarlyBookingObj
   * @param newDiscountFactor
   * @returns {Promise<void>}
   */
  async updateMaxEarlyBookingDiscount(maxEarlyBookingObj, newDiscountFactor) {
    let baseUrl = store.getters.getCurrentDestinationInstance().getBasePeApi()
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const id = maxEarlyBookingObj.customMaxEarlyBookingDiscountId
      await axios.put(baseUrl + 'admin/max_early_booking_discount/' + id, {
        factor: newDiscountFactor,
      })
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * reset a max early booking discount
   * to its default value
   * @param maxEarlyBookingObj
   * @returns {Promise<void>}
   */
  async reset(maxEarlyBookingObj) {
    let baseUrl = store.getters.getCurrentDestinationInstance().getBasePeApi()
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const id = maxEarlyBookingObj.customMaxEarlyBookingDiscountId
      await axios.delete(baseUrl + 'admin/max_early_booking_discount/' + id)
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }
}
