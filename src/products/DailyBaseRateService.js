import moment from 'moment'
import store from '@/store/store'
import DailyBaseRate from './DailyBaseRate'

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
    let baseUrl = store.getters.getCurrentDestinationInstance().getBasePeApi()
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let baseRates = []
    try {
      let response = await axios.get(baseUrl + 'admin/daily_base_rates', {
        params: {
          from: moment(from).format('YYYY-MM-DD'),
          to: moment(to).format('YYYY-MM-DD'),
          productIds: productIds.join(','),
        },
      })

      if (response.status === 200) {
        response.data.forEach((baseRate) => {
          baseRates.push(new DailyBaseRate(baseRate))
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
    let baseUrl = store.getters.getCurrentDestinationInstance().getBasePeApi()
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      await axios.post(baseUrl + 'admin/daily_base_rates', {
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
    let baseUrl = store.getters.getCurrentDestinationInstance().getBasePeApi()
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const id = dailyBaseRateObj.customBaseRateId
      await axios.put(baseUrl + 'admin/daily_base_rates/' + id, {
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
    let baseUrl = store.getters.getCurrentDestinationInstance().getBasePeApi()
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const id = dailyBaseRateObj.customBaseRateId
      await axios.delete(baseUrl + 'admin/daily_base_rates/' + id)
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }
}
