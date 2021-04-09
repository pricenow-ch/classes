import XLSX from 'xlsx'
import XlsxHelper from '@/classes/XLSX/XlsxHelper'
import store from '@/store/store'
import DateHelper from '@/classes/DateHelper'

export default class VoucherExport {
  async getVouchersForExportUntil(lastDate) {
    let reportData = null
    try {
      const response = await axios.get(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/export/voucher/' +
          DateHelper.shiftLocalToUtcIsoString(lastDate)
      )
      reportData = response.data
    } catch (e) {
      EventBus.$emit('notify', e)
    } finally {
      EventBus.$emit('spinnerHide')
    }

    return reportData
  }

  async downloadVoucherExcel(lastDate) {
    EventBus.$emit('spinnerShow')
    let workBook = XLSX.utils.book_new()
    const entries = await this.getVouchersForExportUntil(lastDate)
    if (entries.length > 0) {
      const workSheet = await this.getVoucherWorkSheet(entries)
      await XLSX.utils.book_append_sheet(
        workBook,
        workSheet,
        i18n.t('stornoHistory.voucher')
      )
      EventBus.$emit('spinnerHide')
      XLSX.writeFile(workBook, i18n.t('stornoHistory.voucher') + '.xlsx')
    } else {
      EventBus.$emit('spinnerHide')
      EventBus.$emit('notify', i18n.t('stornoHistory.noData'))
    }
  }

  async getVoucherWorkSheet(entries) {
    let jsonWorksheet = []

    entries.forEach((entry) => {
      jsonWorksheet.push({
        customer: entry.user.firstname + ' ' + entry.user.surname,
        mail: entry.user.mail,
        address: entry.user.address,
        zip: entry.user.zip,
        city: entry.user.city,
        currency: store.getters.getCurrentDestinationInstance().getCurrency(),
        balance: entry.balance / 100,
      })
    })
    let workSheet = XLSX.utils.json_to_sheet(jsonWorksheet)
    let xlsxHelper = new XlsxHelper(workSheet)
    await xlsxHelper.setHeader([
      i18n.t('stornoHistory.customer'),
      i18n.t('stornoHistory.mail'),
      i18n.t('stornoHistory.address'),
      i18n.t('stornoHistory.zip'),
      i18n.t('stornoHistory.city'),
      i18n.t('stornoHistory.currency'),
      i18n.t('stornoHistory.balance'),
    ])

    // set auto width
    await xlsxHelper.setColumnWidthAuto()
    return xlsxHelper.getWorkSheet()
  }
}
