import ExternalTicketProviderState from './ExternalTicketProviderState'

export default class Novatouch extends ExternalTicketProviderState {
  constructor(params) {
    super(params)
    this.type = 'novatouch'
  }
}
