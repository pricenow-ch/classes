import ExternalTicketProviderState from './ExternalTicketProviderState'

export default class Swisspass extends ExternalTicketProviderState {
  constructor(params) {
    super(params)
    this.type = 'swisspass'
  }
}
