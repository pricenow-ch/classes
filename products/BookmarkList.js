/**
 * A bookmark List
 */
export default class BookmarkList {
  constructor(params) {
    this.name = params?.name
    if (params?.prodDefIds?.length) {
      this.prodDefIds = params.prodDefIds
    } else {
      this.prodDefIds = []
    }
  }
}
