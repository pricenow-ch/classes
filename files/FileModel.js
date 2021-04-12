export default class FileModel {
  constructor(fileData) {
    if (fileData) {
      this.id = fileData.id ? fileData.id : null
      this.regionId = fileData.regionId ? fileData.regionId : null
      this.path = fileData.path ? fileData.path : ''
      this.uploadedBy = fileData.uploadedBy ? fileData.uploadedBy : null
      this.type = fileData.type ? fileData.type : null
      this.filename = fileData.filename ? fileData.filename : ''
      this.size = fileData.size ? fileData.size : 0
      this.md5 = fileData.md5 ? fileData.md5 : ''
      this.updatedAt = fileData.updatedAt ? fileData.updatedAt : ''
      this.createdAt = fileData.createdAt ? fileData.createdAt : ''
    }
  }

  /**
   * get the link for the image
   * @returns {string|null}
   */
  getImageUrl() {
    if (this.path) {
      /* global store */
      return `${process.env.VUE_APP_SHOP_API_URL}/${process.env.VUE_APP_DESTINATION}/fileResource/public/${this.path}`
    } else {
      return null
    }
  }
}
