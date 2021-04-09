export default class numberHelper {
  static round(number, roundTo = 50) {
    return Math.round(number / roundTo) * roundTo
  }
}
