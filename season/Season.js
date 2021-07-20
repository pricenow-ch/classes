export default class Season {
  constructor(params) {
    this.id = params.id
    this.from = new Date(params.from)
    this.to = new Date(params.to)
    this.name = params.name
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
