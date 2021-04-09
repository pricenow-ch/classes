/**
 * Helper class for vuetify data table
 * static class for custom sorting which allows to pass function as index
 */
export default class DataTable {
  constructor() {
    // for dropdown
    this.rowsPerPageItems = [10, 20, 30, 40, 50]

    // needed pagination object
    this.pagination = {
      rowsPerPage: 10,
      pageStart: 1,
    }

    // is table loading
    this.loading = true

    // PAGINATION HELPER
    this.highestPage = 2
  }

  // array for dropdown
  getRowsPerPageItems() {
    return this.rowsPerPageItems
  }

  // get rows per page
  getLimit() {
    return this.pagination.rowsPerPage
  }

  getHighestPage() {
    return this.highestPage
  }

  /**
   * custom sort of data table
   * @param items: Array
   * @param index: String
   * @param isDescending: Boolean
   * @returns {*}
   */
  customSort(items, index, isDescending) {
    /* eslint no-unused-vars: 'off' */
    items.sort((a, b) => {
      if (isDescending) {
        if (eval('a.' + index) > eval('b.' + index)) return 1
        if (eval('a.' + index) < eval('b.' + index)) return -1
        return 0
      } else {
        if (eval('a.' + index) < eval('b.' + index)) return 1
        if (eval('a.' + index) > eval('b.' + index)) return -1
        return 0
      }
    })

    return items
  }

  // go to next page or go to previous page
  changePage() {
    if (this.pagination.page >= this.highestPage) {
      this.highestPage++
    }
  }

  reset() {
    this.highestPage = 2

    // reset pagination
    this.resetPaginationObject()
  }

  // reset the pagination object of vuetify data table
  resetPaginationObject() {
    this.pagination.descending = false
    this.pagination.page = 1
    this.pagination.sortBy = null
    this.pagination.totalItems = 0
  }
}
