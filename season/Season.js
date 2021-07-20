export default class Season {
  constructor(params) {
    this.id = params && params.id ? params.id : null
    this.from = params && params.from ? new Date(params.from) : null
    this.to = params && params.to ? new Date(params.to) : null
    this.name = params && params.name ? params.name : null
  }

  getId() {
    return this.id
  }

  getName() {
    return this.name
  }

  getSeasonStart() {
    return this.from
  }

  getSeasonEnd() {
    return this.to
  }
}
