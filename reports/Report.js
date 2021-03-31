export default class Report {
  constructor(params) {
    this.title = params.title
    this.slug = params.slug

    // the name of the vue file
    this.template = params.template

    // orientation of the paper
    this.orientation = params.orientation
  }

  getTitle() {
    return this.title
  }

  getSlug() {
    return this.slug
  }

  getTemplate() {
    return this.template
  }

  getOrientation() {
    return this.orientation ? this.orientation : 'portrait'
  }
}
