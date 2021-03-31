import EntityTranslation from './EntityTranslation'

export default class EntityTranslations {
  constructor(entityTranslations = null) {
    this._entityTranslations = []

    if (entityTranslations) this.parseEntityTranslations(entityTranslations)
  }

  parseEntityTranslations(entityTranslations) {
    for (let i = 0; i < entityTranslations.length; i++) {
      this.entityTranslations.push(
        new EntityTranslation(entityTranslations[i].productTranslation)
      )
    }
  }

  /**
   * todo: save all entities in one request:
   * save all translations of an entity (eg. event)
   * @param entityType
   * @param entityId
   */
  async saveAllEntityTranslations(entityType, entityId) {
    let response = await Promise.all(
      this.entityTranslations.map(async (entityTranslation) => {
        await entityTranslation.createOrUpdateEntityTranslation(
          entityType,
          entityId
        )
      })
    )
    return response
  }

  // Get translation in a particular language or fallback
  getCurrentLanguageTranslationOrFallback() {
    if (this.entityTranslations.length > 0) {
      let entityTranslation = this.getTranslationByLanguageValue(
        store.getters.getActualLanguage(false),
        false
      )

      return entityTranslation ? entityTranslation : this.entityTranslations[0]
    }

    // no entity translation available
    return null
  }

  /**
   * Get translation in a particular language
   * @param languageValue
   * @returns {EntityTranslation|*}
   */
  getTranslationByLanguageValue(
    languageValue,
    createTranslationIfNotFound = false
  ) {
    let entityTranslation = this.entityTranslations.find(
      (tmpTranslation) => tmpTranslation.language === languageValue
    )
    if (entityTranslation) return entityTranslation

    // if no translation exists for the requested language
    if (createTranslationIfNotFound) {
      let newEntityTranslation = new EntityTranslation({
        language: languageValue,
      })
      this.entityTranslations.push(newEntityTranslation)
      return newEntityTranslation
    } else return null
  }

  get entityTranslations() {
    return this._entityTranslations
  }

  set entityTranslations(value) {
    this._entityTranslations = value
  }
}
