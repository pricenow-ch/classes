/**
 * the single capacity of a calendar entry
 * GET niesen/capacity/product/2?from=2019-08-08T00:00:00.00&to=2019-09-01T23:59:00.00
 */

export default class ValueCapacity {
  constructor(params) {
    this.bookable = params.hasOwnProperty('bookable') ? params.bookable : null
    this.capacity = params.hasOwnProperty('capacity') ? params.capacity : null
    this.count = params.hasOwnProperty('count') ? params.count : null
    this.overrideCapacity = params.hasOwnProperty('overrideCapacity')
      ? params.overrideCapacity
      : null
    this.stockLeft = params.hasOwnProperty('stockLeft')
      ? params.stockLeft
      : null
    // simulate stock left (for example within PersonAddingSimple.vue)
    this.stockLeftPreview = null
    this.validCapacity = params.hasOwnProperty('validCapacity')
      ? params.validCapacity
      : null
    // capacity amount for preview purpose (eg. in CapacityOverride.vue)
    this.capacityPreview = null
    this.value = params.hasOwnProperty('value') ? params.value : null
    this.hideInCalendar = params.hideInCalendar || null
    this.sortOrder = params.hasOwnProperty('sortOrder') ? params.sortOrder : 0
  }

  async overrideCapacityAmount(productInstance, from, to, capacity) {
    if (!productInstance)
      throw new Error('No product instance was given to override the capacity!')
    if (!from) throw new Error('No from date was given to override capacity!')
    if (!to) throw new Error('No to date given to override capacity!')
    if (!(capacity >= 0))
      throw new Error('No capacity amount was given to override!')

    EventBus.$emit('spinnerShow')
    try {
      await axios.post(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/capacity/product/override/' +
          productInstance.getId(),
        {
          from: from,
          to: to,
          key: productInstance.getProductCapacity().getKey(),
          value: this.value,
          capacity: parseInt(capacity),
        }
      )
      this.validCapacity = parseInt(capacity)

      EventBus.$emit(
        'notify',
        i18n.t('valueCapacity.capacityUpdated'),
        'success'
      )
    } catch (e) {
      EventBus.$emit('notify', i18n.t('valueCapacity.capacityNotUpdated'))
    } finally {
      EventBus.$emit('spinnerHide')
    }

    return Promise.resolve(this)
  }

  /**
   * SETTERS
   */
  increaseStockLeftPreview(amount = 1) {
    this.stockLeftPreview += amount
    return true
  }
  decreaseStockLeftPreview(amount = 1) {
    if (this.stockLeftPreview <= 0) return false
    this.stockLeftPreview -= amount
    return true
  }

  resetStockLeftPreview() {
    this.stockLeftPreview = null
  }

  setCapacityPreview(amount) {
    this.capacityPreview = amount
  }

  resetCapacityPreview() {
    this.capacityPreview = null
  }

  /**
   * GETTERS
   */
  hasAttributeValue() {
    return this.value !== null
  }

  getTitle() {
    if (this.value) return i18n.t(this.getTranslation())
    return null
  }

  getTranslation() {
    return (
      store.getters.getCurrentDestinationInstance().getSlug() +
      '-attributes-' +
      this.value
    )
  }

  // also overwritten and preview
  getCapacity() {
    return this.capacityPreview !== null
      ? this.capacityPreview
      : this.validCapacity
  }

  // do not consider the capacity preview
  getValidCapacity() {
    return this.validCapacity
  }

  getCount(amount = 0) {
    return this.count + amount
  }

  getStockLeftInPercentage() {
    return Math.round((100 / this.getCapacity()) * this.getCount())
  }

  getStockLeftColor() {
    let percent = this.getStockLeftInPercentage()
    if (percent <= 33) {
      // name of color
      return 'green'
    } else if (percent > 33 && percent < 100) {
      return 'warning'
    } else if (percent >= 100) {
      return 'error'
    }
    return 'error'
  }

  getValue() {
    return this.value
  }

  getCapacityPreview() {
    return this.capacityPreview
  }

  getStockLeft(amount = 0) {
    let stockLeft = this.stockLeft - amount
    if (this.stockLeftPreview) stockLeft = stockLeft - this.stockLeftPreview
    return stockLeft
  }

  isHidden() {
    return this.hideInCalendar
  }
  getSortOrder() {
    return this.sortOrder
  }
}
