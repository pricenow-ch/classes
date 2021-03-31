export default class CancellationType {
  constructor(id, description) {
    this.id = id
    this.description = description
  }

  getType() {
    return this.id
  }

  getId() {
    return this.id
  }

  getDescription() {
    return this.description
  }
}
