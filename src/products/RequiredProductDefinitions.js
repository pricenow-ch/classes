import RequiredProductDefinition from './RequiredProductDefinition'

export default class RequiredProductDefinitions {
  constructor(rawRequiredProductDefinitions) {
    this.requiredProductDefinitions = []
    this.parseApiData(rawRequiredProductDefinitions)
  }

  parseApiData(apiData) {
    for (let i = 0; i < apiData.length; i++) {
      this.requiredProductDefinitions.push(
        new RequiredProductDefinition(apiData[i])
      )
    }
  }

  getRequiredProductDefinitions(withAutoAddToBasket = true) {
    if (withAutoAddToBasket) return this.requiredProductDefinitions
    return this.requiredProductDefinitions.filter(
      (reqProdDef) => !reqProdDef.getAutoAddtoBasket()
    )
  }
}
