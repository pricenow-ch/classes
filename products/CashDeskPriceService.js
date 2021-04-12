import moment from 'moment'
import store from '@/store/store'
import CashDeskPrice from '@/classes/products/CashDeskPrice'
import { peInstance } from '../utils/axiosInstance'

export default class CashDeskPriceService {
  /**
   * load cash desk prices
   * @param from
   * @param to
   * @param prodDefIds
   * @param destinationInstance
   * @returns {Promise<[]>}
   */
  async fetchBetween(from = new Date(), to = new Date(), prodDefIds = []) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let cashDeskPrices = []
    try {
      let response = await peInstance.get('/admin/cash_desk_price', {
        params: {
          from: moment(from).format('YYYY-MM-DD'),
          to: moment(to).format('YYYY-MM-DD'),
          prodDefIds: prodDefIds.join(','),
        },
      })

      if (response.status === 200) {
        response.data.forEach((cashDeskPrice) => {
          cashDeskPrices.push(new CashDeskPrice(cashDeskPrice))
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

    return cashDeskPrices
  }

  async overwrite(cashDeskPriceObj, newPrice) {
    // ToDo: adjust to support post create action aswell
    await this.updateCustomCashDeskPrice(cashDeskPriceObj, newPrice)
  }

  /**
   * create a custom cash desk price
   * @param cashDeskPriceObj
   * @param newPrice
   * @returns {Promise<void>}
   */
  async createCustomCashDeskPrice(cashDeskPriceObj, newPrice) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      await peInstance.post('/admin/daily_base_rates', {
        date: cashDeskPriceObj.date,
        price: newPrice,
        productDefinitionId: cashDeskPriceObj.productDefinitionId,
      })
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * update a custom cash desk price
   * @param cashDeskPriceObj
   * @param newPrice
   * @returns {Promise<void>}
   */
  async updateCustomCashDeskPrice(cashDeskPriceObj, newPrice) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const { id } = cashDeskPriceObj
      await peInstance.put('/admin/cash_desk_price/' + id, {
        price: newPrice,
      })
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * remove a custom cash desk price and reset it to its
   * standard value
   * @param cashDeskPriceObj
   * @returns {Promise<void>}
   */
  async reset(cashDeskPriceObj) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const id = cashDeskPriceObj.id
      await peInstance.delete(`/admin/cash_desk_price/${id}`)
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }
}
