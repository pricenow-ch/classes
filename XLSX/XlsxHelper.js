/**
 * copied from https://gitlab.seccom.ch/seccom-farm-manager/front/blob/development/src/classes/XlsxHelper/XlsxHelper.js
 */
export default class XlsxHelper {
  constructor(workSheet) {
    this.workSheet = workSheet
    this.alphabet = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ]
    this.alphabetIndex = [0]
  }

  /**
   * set auto column width to the worksheet
   * @returns {Promise<PromiseConstructor>}
   */
  async setColumnWidthAuto() {
    // reset alphabet index
    this.alphabetIndex = [0]

    let colWidths = []

    // iterate columns
    let hasColumns = true
    while (hasColumns) {
      let maxChars = 0

      // iterate rows
      let hasRows = true
      let rowIndex = 1
      while (hasRows) {
        let workSheetObject = this.workSheet[
          (await this.getCurrentAlphabetLetter()) + '' + rowIndex
        ]

        if (workSheetObject) {
          let workSheetObjectValue = String(workSheetObject.v)
          maxChars =
            workSheetObjectValue.length > maxChars
              ? workSheetObjectValue.length
              : maxChars

          rowIndex++
        } else if (rowIndex === 1) {
          hasRows = false
          hasColumns = false
        } else {
          hasRows = false
        }
      }

      colWidths.push({ wch: maxChars })

      await this.setNextLetter()
    }

    // apply col widths to the worksheet
    this.workSheet['!cols'] = colWidths

    return Promise
  }

  // set a custom header to the worksheet
  async setHeader(headerArray) {
    // reset alphabet index
    this.alphabetIndex = [0]

    // iterate header array
    for (let headerIndex = 0; headerIndex < headerArray.length; headerIndex++) {
      this.workSheet[(await this.getCurrentAlphabetLetter()) + '1']['v'] =
        headerArray[headerIndex]

      // go to next letter
      await this.setNextLetter()
    }

    return Promise
  }

  // returns current alphabet letter(s) as string
  async getCurrentAlphabetLetter() {
    let alphabetString = ''
    for (let i = 0; i < this.alphabetIndex.length; i++) {
      alphabetString = alphabetString + this.alphabet[this.alphabetIndex[i]]
    }

    return alphabetString
  }

  // set next current letter in the alphabet
  setNextLetter() {
    let lastAlphabetIndex = this.alphabetIndex[this.alphabetIndex.length - 1]

    if (lastAlphabetIndex >= 25) {
      // search for the last alphabet index, not 25
      let foundEntry = false
      for (let i = this.alphabetIndex.length - 1; i >= 0; i--) {
        if (this.alphabetIndex[i] < 25) {
          this.alphabetIndex[i]++
          foundEntry = true
          break
        }

        // reset all alphabet index to 0 and add a new one
        if (!foundEntry) {
          for (let b = 0; b < this.alphabetIndex.length; b++) {
            this.alphabetIndex[b] = 0
          }

          this.alphabetIndex.push(0)
        }
      }
    } else {
      this.alphabetIndex[this.alphabetIndex.length - 1] = lastAlphabetIndex + 1
    }

    return Promise
  }

  /**
   * GETTERS
   */
  getWorkSheet() {
    return this.workSheet
  }
}
