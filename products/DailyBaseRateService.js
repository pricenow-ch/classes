import moment from 'moment'
import DailyBaseRate from './DailyBaseRate'
import { peInstance } from '../utils/axiosInstance'

/**
 * Daily Base Rate Service
 * Fetches base rates for prod defs and a date range
 */
export default class DailyBaseRateService {
  /**
   * load current base Rates
   * @param from
   * @param to
   * @param productIds
   * @param destinationInstance
   * @returns {Promise<[]>}
   */
  async fetchBetween(from = new Date(), to = new Date(), productIds = []) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let baseRates = []
    try {
      const { data, status } = await peInstance(false).get('/admin/daily_base_rates', {
        params: {
          from: moment(from).format('YYYY-MM-DD'),
          to: moment(to).format('YYYY-MM-DD'),
          productIds: productIds.join(','),
        },
      })

      if (status === 200) {
        baseRates = data.map((baseRate) => new DailyBaseRate(baseRate))
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }

    return baseRates
  }

  /**
   * set a new custom daily base rate
   * @param dailyBaseRateObj
   * @param newDiscountFactor
   * @returns {Promise<void>}
   */
  async overwrite(dailyBaseRateObj, newDiscountFactor) {
    if (dailyBaseRateObj.isOverwritten()) {
      await this.updateCustomDailyBaseRate(dailyBaseRateObj, newDiscountFactor)
    } else {
      await this.createCustomDailyBaseRate(dailyBaseRateObj, newDiscountFactor)
    }
  }

  /**
   * create a custom daily base Rate
   * @param dailyBaseRateObj
   * @param newDailyBaseRate
   * @returns {Promise<void>}
   */
  async createCustomDailyBaseRate(dailyBaseRateObj, newDailyBaseRate) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      await peInstance(false).post('/admin/daily_base_rates', {
        date: dailyBaseRateObj.date,
        dailyBaseRate: newDailyBaseRate,
        productId: dailyBaseRateObj.productId,
      })
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * update a custom daily base rate
   * @param dailyBaseRateObj
   * @param newDailyBaseRate
   * @returns {Promise<void>}
   */
  async updateCustomDailyBaseRate(dailyBaseRateObj, newDailyBaseRate) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const id = dailyBaseRateObj.customBaseRateId
      await peInstance(false).put(`/admin/daily_base_rates/${id}`, {
        dailyBaseRate: newDailyBaseRate,
      })
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * remove a custom base rate and reset it to its
   * standard value
   * @param dailyBaseRateObj
   * @returns {Promise<void>}
   */
  async reset(dailyBaseRateObj) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const id = dailyBaseRateObj.customBaseRateId
      await peInstance(false).delete(`/admin/daily_base_rates/${id}`)
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }
}
