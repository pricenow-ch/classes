import Attributes from './Attributes'
import DateHelper from '../DateHelper'
import store from '@/store/store'
import Product from './Product'
import moment from 'moment-timezone'
import Price from './Price'
import definitions from '../../../definitions'
import config from '../../../config'
import RequiredProductDefinitions from './RequiredProductDefinitions'

export default class ProductDefinition {
  constructor(params) {
    this.id = params.id ? params.id : null
    this.name = params.name ? params.name : null
    this.skidataId = params.skidataId ? params.skidataId : null
    this.novaId = params.novaId ? params.novaId : null
    this.minPrice = params.minPrice ? params.minPrice : null
    this.maxPrice = params.maxPrice ? params.maxPrice : null
    this.createdAt = params.createdAt ? params.createdAt : null
    this.updatedAt = params.updatedAt ? params.updatedAt : null
    this.nextLowerProductDefinitionId = params?.nextLowerProductDefinitionId
    this.nextHigherProductDefinitionId = params?.nextHigherProductDefinitionId
    this.updatedAt = params.updatedAt ? params.updatedAt : null
    this.productInstance = null
    if (params.product) {
      this.productInstance = new Product(params.product)
    } else if (params.productInstance) {
      this.productInstance = params.productInstance
    }
    this.productId = params.productId ? params.productId : null

    // representations
    this.durationDays = params.durationDays ? params.durationDays : null
    this.peopleCount = params.peopleCount || 1
    if (!this.peopleCount)
      throw new Error(
        `No peopleCount for product definition id ${this.id} in ProductDefinition.js constructor!`
      )
    this.capacityCount = params.capacityCount || 1
    if (!this.capacityCount)
      throw new Error(
        `No capacityCount for product definition id ${this.id} in ProductDefinition.js constructor!`
      )

    this.availableMedias = params.availableMedia ? params.availableMedia : null
    this.translation = params.translation ? params.translation : null
    // Type: RequiredProductDefinitions
    this.requiredProductDefinitions = new RequiredProductDefinitions(
      params.requiredProductDefinitions || []
    )

    // prices from the api
    this.prices = []
    this.sales = []
    this.capacities = []
    this.destinations = params.destinations

    this.attributes = []
    // only create new attribute instance if we got any from the api
    if (params.attributes && Object.keys(params.attributes).length > 0) {
      this.attributes = new Attributes(params.attributes)
    }
    // this product definition is not to display in the shop. Only in Admin UIs
    this.mauiOnly = params.mauiOnly || null
    // this ticket doesn't need a assigned user (auto assign ticket to main logged in user in SelectMedium.vue)
    this.transferableTicket = params.transferableTicket || false
    // For example, 10 * 60 means that on the same day the product with this attribute can only be
    // booked until 10 o'clock
    this.latestBookingTime = params.latestBookingTime || null
  }

  /**
   * only load prices from the api, if not loaded yet
   * @param fromDateInstance
   * @param toDateInstance
   * @returns {[]|Price[]}
   */
  async lazyLoadPrices(fromDateInstance, toDateInstance) {
    if (
      !this.fromDateInstance ||
      !this.toDateInstance ||
      !this.prices.length ||
      fromDateInstance.getTime() !== this.fromDateInstance.getTime() ||
      toDateInstance.getTime() !== this.toDateInstance.getTime()
    ) {
      // load prices
      await this.loadPrices(fromDateInstance, toDateInstance)

      return Promise
    } else return Promise // the prices in this time span are already loaded. Reload unnecessary
  }

  /**
   * load prices of the product definition from api
   */
  async loadPrices(from = new Date(), to, destinationInstance = null) {
    // set class variables
    this.fromDateInstance = from
    this.toDateInstance = to

    let baseUrl = destinationInstance
      ? store.getters
          .getCurrentDestinationInstance()
          .getPeApi(destinationInstance.getSlug())
      : store.getters.getCurrentDestinationInstance().getPeApi()
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')

    try {
      let response = await axios.get(
        baseUrl + 'products/definition/' + this.id + '/prices',
        {
          params: {
            from: DateHelper.shiftLocalToUtcIsoString(this.fromDateInstance),
            to: DateHelper.shiftLocalToUtcIsoString(this.toDateInstance),
          },
        }
      )

      if (response.status === 200) {
        // reset prices
        this.prices = []

        // iterate prices
        let tmpPrices = response.data.prices
        for (let i = 0; i < tmpPrices.length; i++) {
          this.prices.push(new Price(tmpPrices[i]))
        }
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
      // eslint-disable-next-line no-unsafe-finally
      return Promise
    }
  }

  /**
   * does this product definition has a particular attribute
   * @param key
   * @returns {boolean}
   */
  hasAttribute(key) {
    return this.attributes !== null && this.attributes[key] ? true : false
  }

  hasAttributePair(key, value) {
    return (
      this.attributes !== null &&
      this.attributes[key][definitions.attributeValues.value] === value
    )
  }

  /**
   * @param key
   * @returns {null|*}
   */
  getAttributeValueByKey(key, value = definitions.attributeValues.value) {
    if (this.attributes !== null && this.attributes[key] ? true : false) {
      let attribute = this.attributes[key]
      return attribute[value]
    } else return null
  }

  /**
   * ADMIN FUNCTIONALITIES
   */

  /**
   * overwrite price of a certain product definition
   * @param productDefinitionId
   * @param date
   * @param price
   * @returns {Promise<PromiseConstructor>}
   */
  async overwritePrice(localDateInstance, price) {
    /* global EventBus axios i18n */
    EventBus.$emit('spinnerShow')

    try {
      let response = await axios.post(
        store.getters.getCurrentDestinationInstance().getBasePeApi() +
          'admin/custom_prices',
        {
          productDefinitionId: this.getId(),
          date: DateHelper.shiftLocalToUtcIsoString(localDateInstance),
          price: price * 100,
        }
      )

      if (response.status === 200) {
        // notify user
        EventBus.$emit(
          'notify',
          i18n.t('v6.priceSuccessfullyOverwritten'),
          'success'
        )

        // overwrite price in the product definition instance
        this.setPriceAt(localDateInstance, price * 100)
      }
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise
    }
  }

  async resetPrice(localDateInstance) {
    /* global EventBus axios i18n */
    EventBus.$emit('spinnerShow')

    try {
      let response = await axios.delete(
        store.getters.getCurrentDestinationInstance().getBasePeApi() +
          'admin/custom_prices',
        {
          data: {
            productDefinitionId: this.getId(),
            date: DateHelper.shiftLocalToUtcIsoString(localDateInstance),
          },
        }
      )

      if (response.status === 200) {
        // notify user
        EventBus.$emit('notify', i18n.t('v6.priceSuccessfullyReset'), 'success')

        // reset price in the product definition instance
        this.setPriceAt(localDateInstance, null)
      }
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise
    }
  }

  /**
   * Product definitions can have a latestBookingTime entity. Make the time check
   * @param attributeKey
   * @param attributeValue
   * @param bookingDateInstance
   * @returns {boolean}
   */
  isLatestBookingTimeOk(bookingDateInstance, notify = true) {
    // get latest booking time attribute out of the attributes, if any
    let latestBookingTime = this.getLatestBookingTime()

    // no time constraint set
    if (latestBookingTime === null) return true

    // calc latest booking time today
    let todayMoment = moment().tz(config.timezone)
    let maximalBookingMoment = moment
      .tz(bookingDateInstance, config.timezone)
      .hours(0)
      .minutes(0)
      .seconds(0)
      .milliseconds(0)

    // add or subtract minutes
    if (latestBookingTime < 0)
      maximalBookingMoment.subtract(latestBookingTime * -1, 'm')
    else maximalBookingMoment.add(latestBookingTime, 'm')

    // constraint full filled
    if (todayMoment.valueOf() < maximalBookingMoment.valueOf()) return true

    // constraint violated
    if (notify) {
      const appDestinationInstance = store.getters.getAppDestinationInstance()
      // call different message for niesen's culture events
      if (
        appDestinationInstance.getSlug() === 'niesen' &&
        this.productInstance.isEventTemplate()
      ) {
        EventBus.$emit(
          'notify',
          i18n.t('product.callForBooking', {
            phoneNumber: appDestinationInstance.getTel(),
            bookingTill: maximalBookingMoment.format('DD.MM.YYYY HH:mm'),
          })
        )
      } else {
        EventBus.$emit(
          'notify',
          i18n.t('product.bookingOnlyTill', {
            bookingTill: maximalBookingMoment.format('DD.MM.YYYY HH:mm'),
          })
        )
      }
    }
    return false
  }

  /**
   * SETTERS
   */

  setPriceAt(dateInstance, cents) {
    // iterate prices
    for (let i = 0; i < this.prices.length; i++) {
      let price = this.prices[i]
      if (
        moment(price.validAt).format('YYYY-MM-DD') ===
        moment(dateInstance).format('YYYY-MM-DD')
      ) {
        this.prices[i].customPrice = cents
        break
      }
    }
  }

  /**
   * GETTERS
   */

  getTitle() {
    return i18n.t(this.translation)
  }

  getId() {
    return this.id
  }

  getName() {
    return this.name
  }

  getSkiDataId() {
    return this.skidataId
  }

  getNovaId() {
    return this.novaId
  }

  getMinPrice() {
    return this.minPrice
  }
  getMaxPrice() {
    return this.maxPrice
  }
  getAttributes() {
    return this.attributes
  }
  getCreatedAt() {
    return this.createdAt
  }
  getUpdatedAt() {
    return this.updatedAt
  }

  getTranslation() {
    return this.translation
  }

  getTranslatedName() {
    return i18n.t(this.getTranslation())
  }

  getPrices() {
    return this.prices
  }

  getPriceAt(date) {
    let dateString = moment(date).format('YYYY-MM-DD')
    // iterate prices
    for (let i = 0; i < this.prices.length; i++) {
      let price = this.prices[i]
      if (moment(price.validAt).format('YYYY-MM-DD') === dateString)
        return price
    }
    return null
  }

  getAvailableMedias() {
    return this.availableMedias
  }

  getDurationDays() {
    return this.durationDays
  }

  getProductInstance() {
    return this.productInstance
  }
  // alias for getProductInstance()
  getProduct() {
    return this.productInstance
  }

  getProductId() {
    return this.productId
  }

  getDestinations() {
    return this.destinations
  }

  getPeopleCount() {
    return this.peopleCount
  }

  getCapacityCount() {
    return this.capacityCount
  }

  isMauiOnly() {
    return this.mauiOnly
  }
  isTransferableTicket() {
    return this.transferableTicket
  }
  // alias of isTransferableTicket()
  getTransferableTicket() {
    return this.transferableTicket
  }
  getLatestBookingTime() {
    return this.latestBookingTime
  }

  /**
   *
   * @returns {RequiredProductDefinitions|ProductDefinitionRequirement[]}
   */
  getRequiredProductDefinitions() {
    return this.requiredProductDefinitions
  }

  /**
   * check if the product definition is not
   * depending on another by a factor
   *
   * @returns {boolean|boolean}
   */
  isIndependent() {
    return !(
      !this.nextHigherProductDefinitionId && !this.nextLowerProductDefinitionId
    )
  }
}
