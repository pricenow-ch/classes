/**
 * Expected Demand Model
 */
export default class ExpectedDemand {
  constructor(params) {
    this.date = params?.validity_start_date
    this.demand = params?.tickets_nr
    this.demandPrediction = params?.demand_prediction
  }
}
