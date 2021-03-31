import store from '../../store/store'
import DateHelper from '../DateHelper'
/**
 * Service which allows prices to be overwritten or reverted
 */
export default class PriceOverwriteService {
  /**
   * overwrites the price of chosen product definitions by a relative or absolute amount on given dates
   * @param dates an array of date strings
   * @param changeType a boolean if true absolute prices else relative
   * @param amount the amount in cents
   * @param productDefIds an array of product definition ids
   * @returns {Promise<boolean>} indicating if successful or not
   */
  async overwritePrices(
    dates = [],
    changeType = true,
    amount,
    productDefIds = []
  ) {
    if (dates.length < 1 || productDefIds.length < 1 || !amount) {
      throw new Error(
        'dates ,product ids, amount,  must be defined to overwrite prices!'
      )
    }
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')
    try {
      await axios.post(
        store.getters.getCurrentDestinationInstance().getBasePeApi() +
          'admin/custom_prices/bulk',
        {
          dates: this.formatDatesArray(dates),
          kind: changeType ? 'absolute' : 'relative',
          amount: amount,
          productDefinitionIds: productDefIds,
        }
      )
      EventBus.$emit(
        'notify',
        i18n.t('priceBulkManagement.successOverridePrices'),
        'success'
      )
      return true
    } catch (e) {
      EventBus.$emit('notify', i18n.t('priceBulkManagement.failedOverwriting'))
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * reverts the prices to its original state before they were overwritten
   * @param dates a list of dates
   * @param productDefIds a list of product ids
   * @returns {Promise<boolean>} indicates success
   */
  async resetPrices(dates = [], productDefIds = []) {
    if (dates.length < 1 || productDefIds.length < 1) {
      throw new Error('dates and product ids must be defined to reset prices!')
    }

    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')
    try {
      // unusual to use a body within a delete request
      await axios.delete(
        store.getters.getCurrentDestinationInstance().getBasePeApi() +
          'admin/custom_prices/bulk',
        {
          data: {
            productDefinitionIds: productDefIds,
            dates: this.formatDatesArray(dates),
          },
        }
      )
      EventBus.$emit(
        'notify',
        i18n.t('priceBulkManagement.successResetPrices'),
        'success'
      )
      return true
    } catch (e) {
      EventBus.$emit('notify', i18n.t('priceBulkManagement.failedReverting'))
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * format date for price engine
   * @param dates
   * @returns String[]
   */
  formatDatesArray(dates) {
    return dates.map((date) => {
      return DateHelper.shiftLocalToUtcIsoString(new Date(date)).substr(0, 10)
    })
  }
}
