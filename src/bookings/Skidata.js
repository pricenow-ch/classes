/**
 * contains skidata information of a booking entry. like skidata revocation number
 */
import ExternalTicketProviderState from '@/classes/bookings/ExternalTicketProviderState'

export default class Skidata extends ExternalTicketProviderState {
  constructor(params) {
    super(params)
    this.type = 'skidata'
    this.revocationId = params.skidata_revocationId
      ? params.skidata_revocationId
      : null
    this.orderId = params.skidata_OrderId ? params.skidata_OrderId : null
  }

  /**
   * GETTERS
   */

  getRevocationId() {
    return this.revocationId ? this.revocationId : '-'
  }

  getOrderId() {
    return this.orderId
  }
}
