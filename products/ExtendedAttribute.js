import Asset from './Asset'
import _ from 'lodash'
import EntityTranslations from '../entityTranslations/EntityTranslations'
import { shopInstance } from '../utils/axiosInstance'

export default class ExtendedAttribute {
  constructor(params) {
    this.id = params.id ? params.id : null
    this.pe_productId = params.pe_productId || null
    this.key = params.key ? params.key : null
    this.value = params.value ? params.value : null

    // Type: String <hh:mm>
    this.startTime = params.startTime || null
    this.endTime = params.endTime || null

    this._entityTranslations = params.hasOwnProperty('translations')
      ? new EntityTranslations(params.translations)
      : new EntityTranslations()
    this.assets = []
    this.parseApiAssets(params.assets)
  }

  parseApiAssets(apiAssets) {
    // reset
    this.assets = []
    if (apiAssets) {
      _.orderBy(apiAssets, ['order'], ['desc']).forEach((rawAsset) => {
        this.assets.push(new Asset(rawAsset))
      })
    }
  }

  // short cut
  getCurrentLanguageTranslationOrFallback() {
    return this.entityTranslations.getCurrentLanguageTranslationOrFallback()
  }

  // get first image of assets
  getFirstImageSrc() {
    if (this.assets.length > 0) {
      let fileResource = this.assets[0].fileResource

      if (fileResource) return fileResource.getImageUrl()
      return null
    }
    return null
  }

  getAllImageSrc() {
    if (this.assets.length > 0) {
      let fileRessources = this.assets.map((asset) => {
        let fileRessource = asset.fileResource
        if (fileRessource) return fileRessource.getImageUrl()
        return null
      })
      return fileRessources
    } else {
      null
    }
  }

  async saveTranslations(entityType, entityId = this.id) {
    return await this.entityTranslations.saveAllEntityTranslations(
      entityType,
      entityId
    )
  }

  // save for example start time
  // todo: save all translations within this request
  async saveExtendedAttribute() {
    EventBus.$emit('spinnerShow')
    try {
      const { data } = await shopInstance().post(
        '/admin/product/extendedAttributes',
        {
          productId: this.pe_productId,
          key: this.key,
          value: this.value,
          startTime: this.startTime,
          endTime: this.endTime,
          fileResources: this.prepareApiFileRessources(),
        }
      )

      // fixes the update or create error (22.05.2020)
      // update the id
      this.id = data.id
      return Promise.resolve(response)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('extendedAttribute.saveFailed'))
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  prepareApiFileRessources() {
    return this.assets.map((asset) => {
      return {
        id: asset.fileResource.id,
        order: asset.id,
      }
    })
  }

  getStartTime() {
    return this.startTime
  }

  getEndTime() {
    return this.endTime
  }

  get entityTranslations() {
    return this._entityTranslations
  }

  set entityTranslations(value) {
    this._entityTranslations = value
  }
}
