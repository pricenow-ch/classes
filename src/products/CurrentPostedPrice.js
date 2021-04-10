import Price from './Price'
import moment from 'moment'

/**
 * Representation of a single current posted price
 */
export default class CurrentPostedPrice extends Price {
  constructor(params, lastCalculationDate) {
    super(params)
    if (params.productDefinitionId) {
      this.productDefinitionId = params.productDefinitionId
    } else {
      this.productDefinitionId = params?.productDefinition?.id
    }
    this.calculatedAt = params?.calculatedAt
    this.lastCalculationDate = lastCalculationDate
  }

  getChartFormattedPrice() {
    return this.getRealPrice() / 100
  }
  getChartFormattedValidAt() {
    return moment(this.getValidAt()).format('DD.MM.YY')
  }
}
