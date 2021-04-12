import { shopInstance } from '../utils/axiosInstance'

export default class EntityTranslation {
  constructor(params) {
    this._id = params.id || null
    this._language = params.language || null
    this._title = params.title || null
    this._mediumText = params.mediumText || null
    this._icons = params.icons ? JSON.parse(params.icons) : []
    this._longText = params.longText || null
  }

  /**
   * Saves the new entity translation to the api
   * @returns {Promise<Boolean>}
   */
  async createOrUpdateEntityTranslation(type, typeId) {
    if (!type || !typeId || !this.language || !this.mediumText)
      throw new Error(
        'Missing entity translation attributes on createOrUpdateEntityTranslation method!'
      )

    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      const { data } = await shopInstance().post(
        `/admin/productTranslation/${type}/${typeId}/${this.language}`,
        {
          title: this.title,
          mediumText: this.mediumText,
          longText: this.longText,
          icons: JSON.stringify(this.icons),
        }
      )

      this.id = data.id
    } catch (e) {
      EventBus.$emit('notify', i18n.t('entityTranslation.entityNotCreated'))
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise.resolve(this)
    }
  }

  /**
   *  GETTERS and SETTERS
   */
  get id() {
    return this._id
  }

  set id(value) {
    this._id = value
  }

  get mediumText() {
    return this._mediumText
  }

  set mediumText(value) {
    this._mediumText = value
  }

  get language() {
    return this._language
  }

  set language(value) {
    this._language = value
  }

  get title() {
    return this._title
  }

  set title(value) {
    this._title = value
  }

  get longText() {
    return this._longText
  }

  set longText(value) {
    this._longText = value
  }

  get icons() {
    return this._icons
  }

  set icons(value) {
    this._icons = value
  }
}
