import DateHelper from '../DateHelper'
import moment from 'moment-timezone'
import UserData from './UserData'
import definitions from '@/definitions'

export default class BasketEntry {
  constructor(params) {
    this.id = params.hasOwnProperty('id') ? params.id : null

    if (params.price) {
      this.priceGross = params.price.gross || 0
      this.priceNet = params.price.net || 0
    }
    this.productDefinitionInstance = params.hasOwnProperty(
      'productDefinitionInstance'
    )
      ? params.productDefinitionInstance
      : null

    // instance of UserData class
    this.userData = params.hasOwnProperty('userData')
      ? new UserData(params.userData)
      : null

    // Date instance || null
    this.validFrom = params.validFrom
      ? DateHelper.shiftUtcToLocal(new Date(params.validFrom))
      : null

    // this product was required by another
    this._requirerBasketEntryId = params.requirerBasketEntryId || null
  }

  /**
   * check if the booking entry is in a particular booking state
   * @param key
   * @param activeModule: Boolean | ShopModule
   * @returns {boolean}
   */
  isEntryInBookingState(key, activeModule = false) {
    return (
      this.userData &&
      this.userData.getBookingState() === key &&
      (!activeModule ||
        activeModule.getProductInstanceByProductDefinitionId(
          this.getProductDefinitionId()
        ))
    )
  }

  /**
   * get the fee for the selected card
   * @returns {number|number|module.exports.properties.availableMedia.items.items.properties.fee|{type, minimum, required}|number}
   */
  getBookingFee() {
    return this.getSelectedMedia() ? this.getSelectedMedia().fee : 0
  }

  /**
   * currently selected media of this product definition
   * @returns {null|*}
   */
  getSelectedMedia() {
    let availableMedia = this.productDefinitionInstance.getAvailableMedias()
    // iterate available media
    for (let i = 0; i < availableMedia.length; i++) {
      let media = availableMedia[i]
      if (media.value === this.userData.getMedia()) return media
    }

    return null
  }

  /**
   * @param uid
   * @returns {Promise<boolean>}
   */
  async validateAge(uid, bd = null) {
    // is ticket transferable? => do not check the age
    if (this.getProductDefinition().isTransferableTicket()) return true

    // get user's birthday
    /* global store EventBus i18n */
    if (!bd) {
      let userInstanceToChange = await store.getters
        .getAppUserInstance()
        .getUserById(uid)
      bd = userInstanceToChange.getBirthdate()
    }

    let minAge = this.getAttributeValueByKey(
      definitions.attributeKeys.age,
      definitions.attributeValues.minAge
    )
    let maxAge = this.getAttributeValueByKey(
      definitions.attributeKeys.age,
      definitions.attributeValues.maxAge
    )
    let minYear = this.getAttributeValueByKey(
      definitions.attributeKeys.age,
      definitions.attributeValues.minYear
    )
    let maxYear = this.getAttributeValueByKey(
      definitions.attributeKeys.age,
      definitions.attributeValues.maxYear
    )

    // minAge-maxAge mode
    if (
      minAge !== null &&
      minAge !== undefined &&
      maxAge !== null &&
      maxAge !== undefined
    ) {
      // calc users age in years
      let usersAge = moment(this.getValidFrom()).diff(bd, 'years')

      if (usersAge >= minAge && usersAge <= maxAge) return true
      // age check is ok
      else if (usersAge < minAge) {
        // user is too young
        EventBus.$emit('notify', i18n.t('personalData.tooYoung'))
        return false
      } else if (usersAge > maxAge) {
        // user is too old
        EventBus.$emit('notify', i18n.t('personalData.tooOld'))
        return false
      } else return false
    } else if (minYear && maxYear) {
      // minYear-maxYear mode
      let bdYear = new Date(bd).getFullYear()

      if (bdYear >= minYear && bdYear <= maxYear) return true
      // age check is ok
      else if (bdYear < minYear) {
        // too old
        EventBus.$emit('notify', i18n.t('personalData.tooOld'))
        return false
      } else if (bdYear > maxYear) {
        // too young
        EventBus.$emit('notify', i18n.t('personalData.tooYoung'))
        return false
      } else return true
    } else return true // no age check required
  }

  gaRequired() {
    let swisspassAttribute = this.getProductDefinition().getAttributes()[
      definitions.attributeKeys.swisspass
    ]
    return (
      swisspassAttribute &&
      swisspassAttribute.value === definitions.attributeValueContent.withGA
    )
  }

  halfFareRequired() {
    let swisspassAttribute = this.getProductDefinition().getAttributes()[
      definitions.attributeKeys.swisspass
    ]
    return (
      swisspassAttribute &&
      swisspassAttribute.value ===
        definitions.attributeValueContent.withHalfFare
    )
  }

  gaOrHalfFareRequired() {
    let swisspassAttribute = this.getProductDefinition().getAttributes()[
      definitions.attributeKeys.swisspass
    ]
    return (
      swisspassAttribute &&
      swisspassAttribute.value ===
        definitions.attributeValueContent.withHalfFareOrGA
    )
  }

  onlySwisspassAllowed() {
    return (
      this.gaRequired() ||
      this.halfFareRequired() ||
      this.gaOrHalfFareRequired()
    )
  }

  getRequiredSwisspassAbo() {
    return this.getProductDefinition().getAttributes()[
      definitions.attributeKeys.swisspass
    ].value
  }

  /**
   * SETTERS
   */

  setProductDefinitionInstance(productDefinitionInstance) {
    this.productDefinitionInstance = productDefinitionInstance
  }

  setValidFrom(dateInstance) {
    this.validFrom = dateInstance
  }

  setBookingState(bookingState) {
    this.userData.setBookingState(bookingState)
  }

  setUserData(userDataInstance) {
    this.userData = userDataInstance
  }

  setUser(userInstance) {
    this.userData.uid = userInstance.getId()
    this.userData.user = userInstance
  }

  /**
   * GETTERS
   */

  /**
   * get the name of the product or the event
   * @returns String
   */
  getTitle() {
    // return event name
    if (this.userData.eventId && !this.isRequiredEntry()) {
      // for admin basket
      if (this.userData.eventName) return this.userData.eventName

      // normal basket
      let event = store.getters
        .getShopModulesInstance()
        .getEventInstanceByEventId(this.userData.eventId)
      return event.title
    }
    // normal product title
    let product = this.getProductDefinition().getProductInstance()
    return product ? i18n.t(product.getTranslation()) : ''
  }

  getFirstImageSrc() {
    // consider event
    if (this.userData.eventId && !this.isRequiredEntry()) {
      let event = store.getters
        .getShopModulesInstance()
        .getEventInstanceByEventId(this.userData.eventId)
      return event.getFirstImageSrc()
    } else {
      let productId = this.getProductDefinitionInstance().getProductId()
      let productInstance = store.getters
        .getShopModulesInstance()
        .getProductInstanceByProductId(productId)
      if (productInstance) return productInstance.getFirstImageSrc()
      return store.getters.getAppDestinationInstance().getDefaultProductImage()
    }
  }

  getDescription() {
    return i18n.t(this.productDefinitionInstance.getTranslation())
  }

  getValidFrom(format = null) {
    if (format) {
      return moment(this.validFrom).format(format)
    }
    return this.validFrom
  }

  getFormatedDate() {
    return moment(this.validFrom).format('DD.MM.YYYY')
  }

  getId() {
    return this.id
  }

  getProductDefinitionId() {
    return this.productDefinitionInstance
      ? this.productDefinitionInstance.getId()
      : null
  }

  getProductDefinitionInstance() {
    return this.productDefinitionInstance
  }

  // alias of getProductDefinitionInstance()
  getProductDefinition() {
    return this.productDefinitionInstance
  }

  getProduct() {
    return this.getProductDefinition().getProductInstance()
  }

  getRequiredProductDefinitionsArray() {
    return this.getProductDefinition()
      .getRequiredProductDefinitions()
      .getRequiredProductDefinitions()
  }

  getAttributeValueByKey(key, value) {
    return this.productDefinitionInstance.getAttributeValueByKey(key, value)
  }

  getUserData() {
    return this.userData
  }

  getUid() {
    return this.getUserData().uid
  }

  // alias for price gross
  getPrice() {
    return this.priceGross
  }

  getPriceGross() {
    return this.priceGross
  }

  getPriceNet() {
    return this.priceNet
  }

  isRequiredEntry() {
    return this.requirerBasketEntryId > 0
  }

  getEventId() {
    return this.getUserData()?.getEventId()
  }

  isEventEntry() {
    return !!this.getEventId()
  }

  get requirerBasketEntryId() {
    return this._requirerBasketEntryId
  }

  set requirerBasketEntryId(value) {
    this._requirerBasketEntryId = value
  }
}
