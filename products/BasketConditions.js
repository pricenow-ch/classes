import BasketCondition from './BasketCondition'
import Attributes from './Attributes'
import _ from 'lodash'

export default class BasketConditions {
  constructor(params = []) {
    this.basketConditions = []
    params.forEach((condition) =>
      this.basketConditions.push(new BasketCondition(condition))
    )
  }

  getBasketConditions() {
    return this.basketConditions
  }

  /**
   *
   * @returns {boolean}
   * @param productDefinitions
   * @param allowMultiples
   */
  basketConditionsMet(productDefinitions, allowMultiples = false) {
    let nextMultiple = null
    // sort basket conditions to properly check multiples of a basket condition
    // eg. min has to be checked before max to correctly calc the multiple factor
    const sortingArr = ['min', 'max']
    const basketConditions = [...this.basketConditions].sort((a, b) => {
      return (
        sortingArr.indexOf(a.getCondition()) -
        sortingArr.indexOf(b.getCondition())
      )
    })
    // check each basket condition
    for (let i in basketConditions) {
      const basketCondition = basketConditions[i]
      const condition = basketCondition.getCondition()
      let conditionCount = basketCondition.getCount()
      let effectiveCount = this.countEntriesByKeyValueProductId(
        productDefinitions,
        basketCondition.getAttributeKey(),
        basketCondition.getAttributeValue(),
        basketCondition.getProductId()
      )
      // allow multiple of a basket conditions
      if (nextMultiple === null && allowMultiples) {
        nextMultiple = Math.floor(effectiveCount / conditionCount) || 1
      }
      if (allowMultiples) {
        conditionCount *= nextMultiple
      }
      // perform the checks
      if (condition === 'min' && conditionCount > effectiveCount) return false
      else if (condition === 'max' && conditionCount < effectiveCount)
        return false
    }
    return true
  }
  countEntriesByKeyValueProductId(productDefinitions, key, value, productId) {
    const filteredProductDefinitions = productDefinitions.filter(
      (productDefinition) => {
        if (
          productDefinition.productId === productId &&
          productDefinition.attributes[key] &&
          productDefinition.attributes[key].value === value
        )
          return true
        return false
      }
    )
    return filteredProductDefinitions.length
  }

  /**
   * Helper class
   */
  groupBasketConditionsByAttributeKey() {
    return _.groupBy(this.basketConditions, (basketCondition) =>
      basketCondition.getAttributeValue()
    )
  }

  /**
   * Compose text witch reflects all basket conditions of this instance.
   * @returns {string}
   */
  getText() {
    let text = ''
    const groupedBasketConditions = this.groupBasketConditionsByAttributeKey()
    for (let attributeValue in groupedBasketConditions) {
      // 1. compose condition of the same attribute value
      let basketConditions = groupedBasketConditions[attributeValue]
      // sort conditions (by order of excel importer file)
      basketConditions.sort((a, b) => {
        return a.getId() - b.getId()
      })
      let conditionTexts = ''
      basketConditions.forEach((basketCondition, index) => {
        const count = basketCondition.getCount()
        conditionTexts += i18n.t(
          `basketConditions.textComposition.${basketCondition.getCondition()}`,
          { count }
        )
        if (index < basketConditions.length - 1) {
          conditionTexts += ` ${i18n.t(
            'basketConditions.textComposition.but'
          )} `
        }
      })
      // 2. compose full text of a single basket condition group and put them together
      const translationKey = 'basketConditions.textComposition.conditionText'
      const attributeTitle = Attributes.getTitleByValue(
        basketConditions[0].getAttributeValue()
      )
      text += `${i18n.t(translationKey, { attributeTitle, conditionTexts })} \n`
    }
    return text.slice(0, -1)
  }
}
