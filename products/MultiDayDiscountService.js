import moment from 'moment'
import MultiDayDiscount from '@/classes/products/MultiDayDiscount'
import { peInstance } from '../utils/axiosInstance'

export default class CurrentPostedPriceService {
  /**
   * load multi day discount
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
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let multiDayDiscounts = []
    try {
      const { status, data } = await peInstance(false).get(
        '/admin/multi_day_discount',
        {
          params: {
            from: moment(from).format('YYYY-MM-DD'),
            to: moment(to).format('YYYY-MM-DD'),
            prodDefIds: productDefinitionIds.join(','),
          },
        }
      )

      if (status === 200) {
        multiDayDiscounts = data.map(
          (multiDayDiscount) => new MultiDayDiscount(multiDayDiscount)
        )
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }

    return multiDayDiscounts
  }

  /**
   * set a new multi day discount factor
   * @param cashDeskPriceObj
   * @param newPrice
   * @returns {Promise<void>}
   */
  async overwrite(multiDayDiscountObj, newDiscountFactor) {
    if (multiDayDiscountObj.isCustomMultiDayFactor()) {
      await this.updateMultiDayDiscount(multiDayDiscountObj, newDiscountFactor)
    } else {
      await this.createNewMultiDayDiscount(
        multiDayDiscountObj,
        newDiscountFactor
      )
    }
  }

  /**
   * create a new custom multi day discount
   * @param multiDayDiscountObjs
   * @param newDiscountFactor
   * @returns {Promise<void>}
   */
  async createNewMultiDayDiscount(multiDayDiscountObjs, newDiscountFactor) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      await peInstance(false).post('/admin/multi_day_discount', {
        date: multiDayDiscountObjs.date,
        productdefinitionid: multiDayDiscountObjs.productDefinitionId,
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
   * update a custom multi day discount
   * @param multiDayDiscountObj
   * @param newDiscountFactor
   * @returns {Promise<void>}
   */
  async updateMultiDayDiscount(multiDayDiscountObj, newDiscountFactor) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const id = multiDayDiscountObj.customMultiDayDiscountId
      await peInstance(false).put(`/admin/multi_day_discount/${id}`, {
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
   * remove a custom multi day discount
   * and reset it to its standard value
   * @param multiDayDiscountObj
   * @returns {Promise<void>}
   */
  async reset(multiDayDiscountObj) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const id = multiDayDiscountObj.customMultiDayDiscountId
      await peInstance(false).delete(`/admin/multi_day_discount/${id}`)
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }
}
