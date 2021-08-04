export default class ExternalId {
  constructor(params) {
    this.productDefinitionId = params.productDefinitionId || null
    this.system = params.system || null
    this.kind = params.kind || null
    this.value = params.value || null
  }

  getKind() {
    return this.kind
  }
  getValue() {
    return this.value
  }
}
