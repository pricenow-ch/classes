import Report from './Report'

export default class Reports {
  constructor(reportsConfig) {
    this.reports = []
    this.reportsConfig = reportsConfig
  }

  // load all reports from destination config file
  // destination => Type: string
  async initReports(destination) {
    // load reports from config file
    // let reportsConfig = await import(
    //   '../../../shopConfiguration/' + destination + '.js'
    // )
    // let reports = reportsConfig.default.reports

    // iterate reports
    for (let report in this.reportsConfig) {
      this.reports.push(new Report(reports[report]))
    }
  }

  getReports() {
    return this.reports
  }
}
