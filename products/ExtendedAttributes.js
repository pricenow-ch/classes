import ExtendedAttribute from './ExtendedAttribute'
import store from '../../store/store'
import _ from 'lodash'

export default class ExtendedAttributes {
  constructor(extendedAttributes, type, typeId) {
    this.extendedAttributes = []
    // event or extendedAttributes (product)
    this.type = type

    // eventId or productId
    this.typeId = typeId

    if (extendedAttributes) {
      this.parseApiData(extendedAttributes)
    }
  }

  /**
   * load the additional attributes for this product
   * @returns {Promise<[]|*[]>}
   */
  async fetchExtendedAttributes() {
    this.extendedAttributes = []
    /* global EventBus axios store */
    try {
      let response = await axios.get(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'products/' +
          this.type +
          '?ids=' +
          this.typeId
      )

      await this.parseApiData(response.data)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('product.failedLoadingAdditionAttr'))
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise.resolve(this.extendedAttributes)
    }
  }

  parseApiData(apiData) {
    apiData.forEach((attribute) => {
      this.extendedAttributes.push(new ExtendedAttribute(attribute))
    })

    return true
  }

  /**
   * if key and val are null it will set the fileResource on the product level
   * if key and val are set it adds the fileResource to the extended attr
   * @param extAttrKey
   * @param extAttrVal
   * @param fileResources
   * @param isRemoval
   * @returns {Promise<[]>}
   */
  async linkImages(
    extAttrKey,
    extAttrVal,
    fileResources = [],
    reset = false,
    isRemoval = false
  ) {
    // eg. for start and end date
    let extendedAttribute = this.findExtendedAttributeByKeyAndValue(
      extAttrKey,
      extAttrVal
    )

    // reset array
    if (reset) this.reset()

    const duplicate = this.extendedAttributes.filter(
      (attr) => attr.value === extAttrVal && attr.key === extAttrKey
    )
    if (duplicate.length === 1 && !isRemoval) {
      duplicate[0].assets.forEach((asset) => {
        fileResources.push({
          id: asset.fileResource.id,
          order: duplicate[0].assets.length + 1,
        })
      })
    }

    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const response = await axios.post(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/product/' +
          this.type,
        {
          productId: this.typeId,
          key: extAttrKey,
          value: extAttrVal,
          startTime: extendedAttribute ? extendedAttribute.startTime : null,
          endTime: extendedAttribute ? extendedAttribute.endTime : null,
          fileResources: fileResources,
        }
      )
      this.addOrMergeExtendedAttributeFileResources(
        new ExtendedAttribute(response.data)
      )
    } catch (e) {
      EventBus.$emit('notify', e.response)
    }

    EventBus.$emit('spinnerHide')
    return Promise.resolve(this.extendedAttributes)
  }

  /**
   * takes an extendendAttribute and adds it or merges its file resources
   * @param extAttr ExtendedAttribute Instance
   * @returns {[]|*[]}
   */
  addOrMergeExtendedAttributeFileResources(extAttr) {
    const duplicateIndex = _.findIndex(this.extendedAttributes, {
      key: extAttr.key,
      value: extAttr.value,
    })
    if (duplicateIndex < 0) {
      this.extendedAttributes.push(extAttr)
    } else {
      this.extendedAttributes.splice(duplicateIndex, 1, extAttr)
    }

    return this.extendedAttributes
  }

  /**
   * Remove an asset
   * @param extAttr
   * @param assetId
   */
  async removeExtendedAttributeFileResource(extAttr, assetId) {
    const index = _.findIndex(this.extendedAttributes, { id: extAttr.id })
    if (index > -1) {
      const assetIndex = _.findIndex(this.extendedAttributes[index].assets, {
        id: assetId,
      })
      this.extendedAttributes[index].assets.splice(assetIndex, 1)
      let fileResources = []
      this.extendedAttributes[index].assets.forEach((asset) => {
        fileResources.push({
          id: asset.fileResource.id,
          order: 1,
        })
      })
      await this.linkImages(
        extAttr.key,
        extAttr.value,
        fileResources,
        false,
        true
      )
    } else {
      throw new Error('Extended Attribute with id ' + extAttr.id + ' not found')
    }
  }

  /**
   * get extended attributes filtered by value and key
   * @param value
   * @param key
   * @returns {ExtendedAttribute[]}
   */
  getExtendedAttributeByValueAndKey(value = null, key = null) {
    return this.extendedAttributes.filter(
      (attr) => attr.value === value && attr.key === key
    )
  }

  findExtendedAttributeByKeyAndValue(key = null, value) {
    return this.extendedAttributes.find(
      (attr) => attr.key === key && attr.value === value
    )
  }

  getFirstNotProductLevelAttribute() {
    return this.extendedAttributes.find((attribute) => attribute.key !== null)
  }

  getProductLevelAttribute() {
    return this.extendedAttributes.find((attribute) => attribute.key === null)
  }

  // save all translations of an extended attribute containing a particular key (e.g. null)
  async saveExtendedAttributesByKey(key = null) {
    let extendedAttributes = this.extendedAttributes.filter(
      (attribute) => attribute.key === key
    )

    let response = await Promise.all(
      await extendedAttributes.map(async (extendedAttribute) => {
        // api twist
        if (this.type === 'events')
          await extendedAttribute.saveTranslations(this.type, this.typeId)
        else await extendedAttribute.saveTranslations(this.type)
      })
    )

    EventBus.$emit('notify', i18n.t('event.eventUpdated'), 'success')
    return response
  }

  reset() {
    this.extendedAttributes = []
  }
}
