import ExternalId from './ExternalId'

export default class ExternalIds {
  constructor() {
    // Type ExternalId
    this.externalIds = []
    return this
  }
  parseApiData(data) {
    if (!data) return this
    this.externalIds = data.map((externalId) => {
      return new ExternalId(externalId)
    })
    return this
  }

  getExternalIdByKind(kind) {
    return this.externalIds.find((externalId) => externalId.getKind() === kind)
  }
}
