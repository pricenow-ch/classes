import Report from './Report'

export default class Reports {
  constructor() {
    this.reports = []
  }

  // load all reports from destination config file
  // destination => Type: string
  async initReports(destination) {
    // load reports from config file
    let reportsConfig = await import(
      '../../../shopConfiguration/' + destination + '.js'
    )
    let reports = reportsConfig.default.reports

    // iterate reports
    for (let report in reports) {
      this.reports.push(new Report(reports[report]))
    }
  }

  getReports() {
    return this.reports
  }
}
