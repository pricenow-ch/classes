/**
 * the capacity calendar entry for a given product capacity
 */
import ValueCapacity from './ValueCapacity'
import DateHelper from '../utils/DateHelper'

export default class DailyCapacity {
  constructor(params) {
    this.date = params.hasOwnProperty('date')
      ? DateHelper.shiftUtcToLocal(new Date(params.date))
      : null
    this.key = params.hasOwnProperty('key') ? params.key : null
    this.valueCapacities = []
    if (params.hasOwnProperty('capacities')) {
      this.parseCapacities(params.capacities)
    }
  }

  parseCapacities(caps) {
    caps.forEach((capacity) => {
      this.valueCapacities.push(new ValueCapacity(capacity))
    })
    // sort value capacities by sort order
    this.valueCapacities.sort((a, b) => {
      return a.getSortOrder() - b.getSortOrder()
    })
  }

  resetStockLeftPreview() {
    for (let i = 0; i < this.valueCapacities.length; i++) {
      this.valueCapacities[i].resetStockLeftPreview()
    }
  }

  resetCapacityPreviews() {
    for (let i = 0; i < this.valueCapacities.length; i++) {
      this.valueCapacities[i].resetCapacityPreview()
    }
  }

  getValueCapacities() {
    return this.valueCapacities
  }

  getKey() {
    return this.key
  }

  getTranslation() {
    return (
      store.getters.getCurrentDestinationInstance().getSlug() +
      '-attributes-' +
      this.key
    )
  }

  getDate() {
    return this.date
  }

  getValueCapacityByValue(attributeValue = null) {
    for (let i = 0; i < this.valueCapacities.length; i++) {
      if (this.valueCapacities[i].getValue() === attributeValue)
        return this.valueCapacities[i]
    }

    return null
  }
}
