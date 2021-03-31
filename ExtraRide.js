import DateHelper from './DateHelper'

export default class ExtraRide {
  constructor(params) {
    this.id = params.id ? params.id : null
    this.regionId = params.regionId ? params.regionId : null
    this.ascentDate = params.ascentDate
      ? DateHelper.shiftUtcToLocal(new Date(params.ascentDate))
      : null
    this.descentDate = params.descentDate
      ? DateHelper.shiftUtcToLocal(new Date(params.descentDate))
      : null
    this.updatedBy = params.updatedBy ? params.updatedBy : null
    this.comment = params.comment ? params.comment : null
    this.createdAt = params.createdAt ? new Date(params.createdAt) : null
    this.updatedAt = params.updatedAt ? new Date(params.updatedAt) : null
    this.user = params.user ? params.user : null
  }
}
