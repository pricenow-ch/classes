/**
 * the capacity data for a given product
 */
import DailyCapacity from './DailyCapacity'

export default class ProductCapacity {
  constructor(params) {
    this.pe_productId = params.hasOwnProperty('pe_productId')
      ? params.pe_productId
      : null

    // when asking for a time period
    this.calendar = params.hasOwnProperty('calendar') ? params.calendar : []
    if (params.hasOwnProperty('calendar')) {
      this.calendar = []
      this.parseCalendarEntries(params.calendar)
    }
  }

  parseCalendarEntries(entries) {
    entries.forEach((entry) => {
      this.calendar.push(new DailyCapacity(entry))
    })
  }

  /**
   * Create new capacity for this product
   * @param capacity
   * @param key
   * @param value
   * @returns {Promise<ProductCapacity>}
   */
  async createCapacity(capacity, key = null, value = null, product) {
    if (!capacity) throw new Error('No capacity was given on create.')
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    // prepare sort order
    let sortOrder = this.getSortOrderFromProduct(product, key, value)
    try {
      await axios.post(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/capacity/product/' +
          this.pe_productId,
        {
          capacity,
          key,
          value,
          sortOrder,
        }
      )

      EventBus.$emit(
        'notify',
        i18n.t('productCapacity.capacityCreatedSuccessfully'),
        'success'
      )
    } catch (e) {
      EventBus.$emit('notify', i18n.t('notify.errorCreatingNewCapacity'))
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise.resolve(this)
    }
  }

  /**
   * destroy me
   * @returns {Promise<ProductCapacity>}
   */
  async deleteCapacities() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      await axios.delete(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/capacity/product/' +
          this.pe_productId
      )

      EventBus.$emit(
        'notify',
        i18n.t('productCapacity.capacityDeletedSuccessfully'),
        'success'
      )
    } catch (e) {
      EventBus.$emit('notify', i18n.t('notify.errorDeleteCapacity'))
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise.resolve(this)
    }
  }

  /**
   * update the capacity amount
   * @param capacity
   * @param value
   * @returns {Promise<ProductCapacity>}
   */
  async updateCapacity(capacityValue, product) {
    if (capacityValue.capacity === null || capacityValue.capacity === undefined)
      throw new Error('No capacity was given on update.')
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')
    // preparing sort order
    let key = this.getKey()
    let value = capacityValue.value
    let sortOrder = this.getSortOrderFromProduct(product, key, value)
    try {
      await axios.patch(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/capacity/product/' +
          this.pe_productId,
        {
          capacity: capacityValue.capacity,
          key,
          value,
          hideInCalendar: capacityValue.hideInCalendar,
          sortOrder,
        }
      )

      // notify user
      EventBus.$emit(
        'notify',
        i18n.t('productCapacity.capacityUpdatedSuccessfully'),
        'success'
      )
    } catch (e) {
      EventBus.$emit('notify', i18n.t('notify.errorUpdateCapacity'))
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise.resolve(this)
    }
  }

  // helper method to get sort order from product instance
  getSortOrderFromProduct(product, key, value) {
    // if capacity is on product level, return sort order 0
    if (key === null) return 0
    // get original sort order from product instance
    let productDefinition = product.filterProductDefinitionsByAttributes(
      [
        {
          key,
          value,
        },
      ],
      true,
      true
    )
    if (!productDefinition)
      throw new Error('No product definition found. Cannot get sort order!')
    return productDefinition.getAttributes()[key].sortOrder
  }

  resetCapacityPreviews() {
    // iterate calendar
    for (let i = 0; i < this.calendar.length; i++) {
      this.calendar[i].resetCapacityPreviews()
    }
  }

  /**
   * does this product has any capacity
   * @returns {boolean}
   */
  isCapacitySet() {
    return this.calendar.length > 0
  }

  /**
   * GETTERS
   */
  getDailyCapacities() {
    return this.calendar
  }

  getProductId() {
    return this.pe_productId
  }

  // array of all capacities on the first calendar day
  getCapacityValues() {
    if (this.calendar.length) {
      return this.calendar[0].getValueCapacities()
    }
    return []
  }

  getFilteredCapacityValues(
    hideEmptyCount = true,
    hideHiddenInCalendar = true
  ) {
    return this.getCapacityValues().filter((valueCapacity) => {
      if (hideEmptyCount && !valueCapacity.getCount()) return false
      if (hideHiddenInCalendar && valueCapacity.isHidden()) return false
      return true
    })
  }

  // return first capacity
  getKey() {
    if (this.calendar.length) return this.calendar[0].getKey()
    return null
  }

  getKeyTranslation() {
    if (this.calendar.length) return this.calendar[0].getTranslation()
  }

  // do we have an active capacity (product or attribute level) ?
  hasCapacityOfAnyType() {
    return this.getCapacityValues().length > 0
  }

  // do we have an active capacity on product level ?
  hasCapacityOfTypeProduct() {
    let capacityValues = this.getCapacityValues()
    if (capacityValues.length) return capacityValues[0].value === null
    return false
  }

  /**
   * search for a capacity on a particular date
   * @param dateInstance
   * @returns {*[]|any}
   */
  getCapacitiesbyDate(dateInstance) {
    let dayCapacity = this.calendar.find((tmpDayCapacity) => {
      return tmpDayCapacity.getDate().getTime() === dateInstance.getTime()
    })
    if (dayCapacity) return dayCapacity.getValueCapacities()
    return []
  }

  getCapacityByDate(dateInstance) {
    return this.calendar.find(
      (dayCapacity) =>
        dayCapacity.getDate().getTime() === dateInstance.getTime()
    )
  }

  // get first day capacity
  getFirstCapacityDate() {
    if (this.calendar.length) {
      return this.calendar[0]
    }

    // no daily capacity at all
    return null
  }

  // get last day capacity
  getLastCapacityDate() {
    if (this.calendar.length) {
      return this.calendar[this.calendar.length - 1]
    }

    // no daily capacity at all
    return null
  }

  /**
   * Get the maximum stock left over all possible attribute values
   * @param dateInstance
   * @returns {boolean|number}
   */
  getMaxStockLeft(dateInstance) {
    // no capacity at all
    if (!this.hasCapacityOfAnyType()) return true

    let attributeValues = this.getCapacityValues()
    let maxCapacity = 0
    // iterate capacity Values
    for (let i = 0; i < attributeValues.length; i++) {
      let capacityValue = attributeValues[i].value
      let maxCapacityForCurrentAttributeValue = this.getStockLeft(
        dateInstance,
        capacityValue
      )
      if (maxCapacityForCurrentAttributeValue > maxCapacity)
        maxCapacity = maxCapacityForCurrentAttributeValue
    }
    return maxCapacity
  }

  /**
   * how many tickets can still be sold
   * @param attributeValue: null || attributeValue
   * @param dateInstance
   * @param basketInstance
   */
  getStockLeft(
    dateInstance,
    attributeValue = null,
    basketInstance = store.getters.getBasketInstance()
  ) {
    // 1. there is no capacity at all
    if (!this.hasCapacityOfAnyType()) return true

    // 2. get the DailyCapacity
    let dayCapacity = this.calendar.find((dailyCapacity) => {
      return dailyCapacity.getDate().getTime() === dateInstance.getTime()
    })

    // 3. there is no capacity for this attribute key (nor on product level)
    // has to be true! => means no capacity constraints at all in PersonAdder.vue
    if (!dayCapacity) return true

    // 4. subtract amount of already added basket entries
    let amountAlreadyInBasket = 0
    let basketEntries = []
    let attributeKey = this.getKey()
    // health check
    if (!this.getProductId()) throw new Error('No product id available!')

    // basket entries on product level
    if (!attributeKey)
      basketEntries = basketInstance.getBasketEntriesOfProductId(
        this.getProductId(),
        dateInstance
      )
    else
      basketEntries = basketInstance.getBasketEntriesWithAttributeAndProductId(
        attributeKey,
        attributeValue,
        this.getProductId(),
        dateInstance
      ) // attribute level

    // iterate basket entries
    for (let basketEntry in basketEntries) {
      amountAlreadyInBasket =
        amountAlreadyInBasket +
        basketEntries[basketEntry].getProductDefinition().getCapacityCount()
    }

    // calc stock left
    let valueCapacity = dayCapacity.getValueCapacityByValue(
      attributeKey === null ? null : attributeValue
    )
    if (!valueCapacity)
      throw new Error('No value capacity found to calc stock left!')
    return valueCapacity.getStockLeft(amountAlreadyInBasket)
  }

  increaseStockLeftPreview(dateInstance, attributeValue) {
    let stockLeft = this.getStockLeft(dateInstance, attributeValue)
    if (stockLeft === true) return true
    else if (stockLeft > 0) {
      return this.getCapacityByDate(dateInstance)
        ?.getValueCapacityByValue(attributeValue)
        ?.increaseStockLeftPreview()
    } else {
      EventBus.$emit('notify', this.$t('personAdder.soldOut'))
      return false // no capacity left
    }
  }

  decreaseStockLeftPreview(dateInstance, attributeValue) {
    return this.getCapacityByDate(dateInstance)
      ?.getValueCapacityByValue(attributeValue)
      ?.decreaseStockLeftPreview()
  }

  resetStockLeftPreview(dateInstance) {
    this.getCapacityByDate(dateInstance)?.resetStockLeftPreview()
  }
}
