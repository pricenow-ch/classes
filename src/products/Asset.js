import FileModel from '../files/FileModel'

export default class Asset {
  constructor(params) {
    this.id = params.id ? params.id : null
    this.order = params.order ? params.order : null
    this.fileResource = params.fileResource
      ? new FileModel(params.fileResource)
      : null
  }
}
