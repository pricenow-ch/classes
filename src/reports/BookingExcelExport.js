import store from '@/store/store'
import DateHelper from '../DateHelper'
import XLSX from 'xlsx'
import XlsxHelper from '../XLSX/XlsxHelper'
import BookingStates from '../bookings/BookingStates'

/**
 * Responsible for generating accounting and cause we care excel exports
 */
export default class AccountingExcelExport {
  /***
   * Fetch the booking data in a date range
   * This will afterwards be exported as an excel file
   * @param from Date()
   * @param to Date()
   * @returns {Promise<[]>}
   */
  async getBookingDataBetween(
    from = new Date(),
    to = new Date(from.getDate() + 7)
  ) {
    /* global EventBus axios store */
    let reportData = null
    try {
      const response = await axios.get(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/export/accounting/' +
          DateHelper.shiftLocalToUtcIsoString(from) +
          '/' +
          DateHelper.shiftLocalToUtcIsoString(to)
      )
      reportData = response.data
    } catch (e) {
      EventBus.$emit('notify', i18n.t('reportsOverview.loadingDataFailed'))
    } finally {
      EventBus.$emit('spinnerHide')
    }

    return reportData
  }

  /**
   * prompt the accounting/cause we care excel download
   * @param from
   * @param to
   * @param vueOptions $options to get access to global filters
   * @returns {Promise<void>}
   */
  async downloadAccountingExcel(from, to, vueOptions) {
    const data = await this.getBookingDataBetween(from, to)
    let accounting = data?.accounting?.length > 0
    let climateCharge = data?.climateCharge?.length > 0
    EventBus.$emit('spinnerShow')
    let workBook = XLSX.utils.book_new()

    if (accounting) {
      await XLSX.utils.book_append_sheet(
        workBook,
        await this.geAccountingWorkSheet(data?.accounting, vueOptions),
        i18n.t('reportsOverview.accounting')
      )
    }

    if (climateCharge) {
      await XLSX.utils.book_append_sheet(
        workBook,
        await this.geCWCWorkSheet(data?.climateCharge),
        i18n.t('reportsOverview.cwc')
      )
    }

    if (accounting || climateCharge) {
      const start = vueOptions.filters.formatDate(from, 'DD/MM/YYYY')
      const end = vueOptions.filters.formatDate(to, 'DD/MM/YYYY')
      XLSX.writeFile(
        workBook,
        i18n.t('reportsOverview.bookings_filename') +
          start +
          '-' +
          end +
          '.xlsx'
      )
      EventBus.$emit('spinnerHide')
    } else {
      EventBus.$emit('spinnerHide')
      EventBus.$emit('notify', i18n.t('reportsOverview.noData'))
    }
  }

  /**
   * build the data sheet for cwc
   * @param data
   * @returns {Promise<Worksheet>}
   */
  async geCWCWorkSheet(data = []) {
    let jsonWorksheet = []
    data.forEach((cwcEntry) => {
      jsonWorksheet.push({
        bookingId: cwcEntry?.bookingId,
        cwc: cwcEntry?.climateCharge,
        vat77: cwcEntry?.vat77,
      })
    })

    let workSheet = XLSX.utils.json_to_sheet(jsonWorksheet)
    let xlsxHelper = new XlsxHelper(workSheet)
    await xlsxHelper.setHeader([
      i18n.t('reportsOverview.idBooking'),
      i18n.t('reportsOverview.cwc'),
      i18n.t('reportsOverview.vat'),
    ])

    // set auto width
    await xlsxHelper.setColumnWidthAuto()
    return xlsxHelper.getWorkSheet()
  }

  /**
   * build the data sheet for the accounting data
   * @param data
   * @returns {Promise<Worksheet>}
   */
  async geAccountingWorkSheet(data = [], vueOptions) {
    let jsonWorksheet = []
    const bookingStatesHelper = new BookingStates()
    data.forEach((bookingEntry) => {
      const vat37 = this._extractVatByRate(3.7, bookingEntry.vats)
      const vat77 = this._extractVatByRate(7.7, bookingEntry.vats)
      const clearedVat37 = this._extractVatByRate(3.7, bookingEntry.clearedVats)
      const clearedVat77 = this._extractVatByRate(7.7, bookingEntry.clearedVats)

      bookingStatesHelper.setBookingState(bookingEntry?.state)
      const bookingStateTrans = bookingStatesHelper.getStateText()

      jsonWorksheet.push({
        bookingId: bookingEntry?.bookingId,
        bundelId: bookingEntry?.bundelId,
        id: bookingEntry?.id,

        product: i18n.t(bookingEntry.translation_product),
        productDefinition: i18n.t(bookingEntry.translation_productDefinition),

        customer:
          bookingEntry?.user?.firstname + ' ' + bookingEntry?.user?.surname,

        start: vueOptions.filters.formatDate(bookingEntry?.start, 'DD/MM/YYYY'),
        end: vueOptions.filters.formatDate(bookingEntry?.end, 'DD/MM/YYYY'),
        state: bookingStateTrans,
        createdAt: vueOptions.filters.formatDate(
          bookingEntry?.createdAt,
          'DD/MM/YYYY'
        ),
        bookingDate: vueOptions.filters.formatDate(
          bookingEntry?.paidAt,
          'DD/MM/YYYY hh:mm:ss'
        ),

        paymentType: bookingEntry?.paymentType
          ? i18n.t('reportsOverview.' + bookingEntry?.paymentType)
          : null,
        note: bookingEntry?.note,

        currency: 'CHF', // is always chf...
        netPrice: bookingEntry?.netPrice
          ? vueOptions.filters.centimesToFr(bookingEntry?.netPrice)
          : null,
        grossPrice: bookingEntry?.grossPrice
          ? vueOptions.filters.centimesToFr(bookingEntry?.grossPrice)
          : null,

        vat37: vat37 ? vueOptions.filters.centimesToFr(vat37) : null, // fixed rates...
        vat77: vat77 ? vueOptions.filters.centimesToFr(vat77) : null,

        cancelAmount: bookingEntry?.cancelAmount
          ? vueOptions.filters.centimesToFr(bookingEntry?.cancelAmount)
          : null,
        cancelDate: vueOptions.filters.formatDate(
          bookingEntry?.cancelDate,
          'DD/MM/YYYY'
        ),
        clearedNetPrice: bookingEntry?.clearedNetPrice
          ? vueOptions.filters.centimesToFr(bookingEntry?.clearedNetPrice)
          : null,
        clearedGrossPrice: bookingEntry?.clearedGrossPrice
          ? vueOptions.filters.centimesToFr(bookingEntry?.clearedGrossPrice)
          : null,
        clearedVat37: clearedVat37
          ? vueOptions.filters.centimesToFr(clearedVat37)
          : null,
        clearedVat77: clearedVat77
          ? vueOptions.filters.centimesToFr(clearedVat77)
          : null,
      })
    })

    let workSheet = XLSX.utils.json_to_sheet(jsonWorksheet)
    let xlsxHelper = new XlsxHelper(workSheet)
    await xlsxHelper.setHeader([
      i18n.t('reportsOverview.accountingHeaders.bookingId'),
      i18n.t('reportsOverview.accountingHeaders.bundelId'),
      i18n.t('reportsOverview.accountingHeaders.id'),
      i18n.t('reportsOverview.accountingHeaders.product'),
      i18n.t('reportsOverview.accountingHeaders.productDefinition'),
      i18n.t('reportsOverview.accountingHeaders.customer'),
      i18n.t('reportsOverview.accountingHeaders.start'),
      i18n.t('reportsOverview.accountingHeaders.end'),
      i18n.t('reportsOverview.accountingHeaders.state'),
      i18n.t('reportsOverview.accountingHeaders.bookingDate'),
      i18n.t('reportsOverview.accountingHeaders.paymentTime'),
      i18n.t('reportsOverview.accountingHeaders.paymentType'),
      i18n.t('reportsOverview.accountingHeaders.note'),
      i18n.t('reportsOverview.accountingHeaders.currency'),
      i18n.t('reportsOverview.accountingHeaders.netPrice'),
      i18n.t('reportsOverview.accountingHeaders.grossPrice'),
      i18n.t('reportsOverview.accountingHeaders.vat37'),
      i18n.t('reportsOverview.accountingHeaders.vat77'),
      i18n.t('reportsOverview.accountingHeaders.cancelAmount'),
      i18n.t('reportsOverview.accountingHeaders.cancelDate'),
      i18n.t('reportsOverview.accountingHeaders.clearedNetPrice'),
      i18n.t('reportsOverview.accountingHeaders.clearedGrossPrice'),
      i18n.t('reportsOverview.accountingHeaders.clearedVat37'),
      i18n.t('reportsOverview.accountingHeaders.clearedVat77'),
    ])

    // set auto width
    await xlsxHelper.setColumnWidthAuto()
    return xlsxHelper.getWorkSheet()
  }

  /**
   * find the vat by the rate and return its value
   * @param rate
   * @param vatArray
   * @returns {number}
   * @private
   */
  _extractVatByRate(rate, vatArray) {
    const vat = vatArray.find((vat) => vat?.rate === rate)
    return vat?.value
  }
}
