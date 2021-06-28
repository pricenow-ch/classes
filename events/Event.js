import moment from 'moment'
import { shopInstance } from '../utils/axiosInstance'
import DateHelper from '../utils/DateHelper'
import ExtendedAttributes from '../products/ExtendedAttributes'

export default class Event {
  constructor(params) {
    this._id = params.id || null
    this._productId = params.pe_productId || null
    this._date = params.date
      ? DateHelper.shiftUtcToLocal(new Date(params.date))
      : null
    this._active = params.active || null
    this._startTime = params.hasOwnProperty('startTime')
      ? params.startTime
      : null
    this._endTime = params.hasOwnProperty('endTime') ? params.endTime : null

    // Type: ExtendedAttributes (images and text)
    this._extendedAttributes = new ExtendedAttributes(
      [{ assets: params.assets, translations: params.translations }],
      'events',
      this.id
    )
  }

  async loadEvent() {
    if (!this.id)
      throw new Error(
        'No event id is provided. Cannot load the event from the api without event id!'
      )

    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      const { data } = await shopInstance().get(`/admin/event/${this.id}`)
      this.constructor(data[0])
      return false
    } catch (e) {
      EventBus.$emit('notify', i18n.t('event.eventCouldNotBeLoaded'))
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * creates a new event out of this instance
   * @returns {Promise<Boolean>}
   */
  async createEvent() {
    EventBus.$emit('spinnerShow')

    try {
      // todo: startTime und endTime korrigieren gemäss Gitlab-Issue: https://gitlab.seccom.ch/skinow/SkinowBookingAPI/issues/108
      const { data } = await shopInstance().post('/admin/event', {
        productId: this.productId,
        date: this.date,
        startTime: this.startTime,
        endTime: this.endTime,
        active: false,
        timePeriod: 'fullDay',
      })

      // save event id
      this.id = data.id
      this.extendedAttributes.typeId = this.id

      // save all translations of this event
      await this.extendedAttributes.saveExtendedAttributesByKey(null)

      EventBus.$emit('notify', i18n.t('event.createdNewEvent'), 'success')
      return true
    } catch (e) {
      EventBus.$emit('notify', i18n.t('event.faildToCreate'))
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  async updateEvent() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')
    const assets = this.getAssets()
    // due to its api nature we have to build the correct obj
    let apiAssetsObjs = []
    assets.forEach((asset) => {
      apiAssetsObjs.push({
        order: asset.order,
        id: asset.fileResource.id,
      })
    })

    try {
      await shopInstance().patch(`/admin/event/${this.id}`, {
        active: !!this.active,
        startTime: this.startTime,
        endTime: this.endTime,
        fileResources: apiAssetsObjs,
      })

      // save all translations of this event
      await this.extendedAttributes.saveExtendedAttributesByKey(null)
      EventBus.$emit('notify', i18n.t('event.eventUpdated'), 'success')
    } catch (e) {
      EventBus.$emit('notify', i18n.t('event.eventNotUpdated'))
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise.resolve(this)
    }
  }

  // set event active and save it
  async publishEvent() {
    this.active = true
    return await this.updateEvent()
  }

  // set event inactive and save it
  async unpublishEvent() {
    this.active = false
    return await this.updateEvent()
  }

  async delete() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')
    let successful = false
    try {
      await shopInstance().delete(`/admin/event/${this.id}`)
      EventBus.$emit('notify', i18n.t('event.eventUpdated'), 'success')
      successful = true
    } catch (e) {
      EventBus.$emit('notify', i18n.t('event.eventNotDeleted'))
    } finally {
      EventBus.$emit('spinnerHide')
    }

    return successful
  }

  getDateInstance() {
    return this._date
  }

  // helper function to get the current entity translation for the event or a fallback language
  getCurrentLanguageTranslationOrFallback() {
    return this.getEntityTranslations().getCurrentLanguageTranslationOrFallback()
  }

  // short cut
  getEntityTranslations() {
    return this.getExtendedAttribute().entityTranslations
  }

  // short cut
  getAssets() {
    return this.getExtendedAttribute().assets
  }

  // short cut
  getExtendedAttribute() {
    let extendedAttributesArray = this.extendedAttributes.getExtendedAttributeByValueAndKey(
      null,
      null
    )
    if (extendedAttributesArray.length > 0) return extendedAttributesArray[0]
    throw new Error('No extended attribute found!')
  }

  getFirstImageSrc() {
    return this.getExtendedAttribute().getFirstImageSrc() || ''
  }

  get title() {
    return this.getCurrentLanguageTranslationOrFallback().title
  }

  get mediumText() {
    return this.getCurrentLanguageTranslationOrFallback().mediumText
  }

  get longText() {
    return this.getCurrentLanguageTranslationOrFallback().longText
  }

  get icons() {
    return this.getCurrentLanguageTranslationOrFallback().icons
  }

  get id() {
    return this._id
  }

  set id(value) {
    this._id = value
  }

  get productId() {
    return this._productId
  }

  get date() {
    return moment(this._date).format('YYYY-MM-DD')
  }

  set productId(productId) {
    this._productId = productId
  }

  set date(date) {
    if (date instanceof Date) this._date = date
    else this._date = new Date(date)
  }

  get active() {
    return this._active
  }

  set active(value) {
    this._active = value
  }

  get startTime() {
    return this._startTime
  }

  set startTime(value) {
    this._startTime = value
  }

  get endTime() {
    return this._endTime
  }

  set endTime(value) {
    this._endTime = value
  }

  get extendedAttributes() {
    return this._extendedAttributes
  }

  set extendedAttributes(value) {
    this._extendedAttributes = value
  }
}
