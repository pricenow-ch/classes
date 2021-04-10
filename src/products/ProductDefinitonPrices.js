import store from '../../../../../src/store/store'
import moment from 'moment'
import Price from './Price'

export default class ProductDefinitionPrices {
  constructor() {
    this.prices = {}
    this.loading = false
  }

  /**
   * Get all prices in a time range for all product definitions
   * @param from
   * @param to
   * @param destinationInstance
   * @returns {Promise<PromiseConstructor>}
   */
  async getAllProductDefinitionPricesOnDate(date, prodIds) {
    let baseUrl = store.getters.getCurrentDestinationInstance().getBasePeApi()
    try {
      this.prices = {}
      this.loading = true
      let response = await axios.get(baseUrl + 'admin/prices/daily', {
        params: {
          productIds: prodIds.join(','),
          date: moment(date).format('YYYY-MM-DD'),
        },
      })

      if (response.status === 200) {
        response.data.prices.forEach((price) => {
          this.prices[price.productDefinition.id] = {}
          this.prices[price.productDefinition.id][price.validAt] = new Price(
            price
          )
        })
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      this.loading = false
    }
  }

  /**
   * use this unique path to acccess the values
   * this makes the operatbility easier and faster
   * than looping and searching arrays
   * @param destSlug
   * @param productDefId
   * @param validAt
   * @returns Price
   */
  getPriceByPath(productDefId, validAt) {
    return this.prices[productDefId]?.[validAt]
  }

  isLoading() {
    return this.loading
  }
}
