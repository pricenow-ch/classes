import { shopInstance } from '../utils/axiosInstance'

export default class CardService {
  async addCardToUser(card, uid) {
    // add new card to user
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')

    try {
      await shopInstance().post('/skicard', {
        cardNumber: card.getCardNumber(),
        type: card.getType(),
        uid: uid,
        zip: card.getZip(),
        cardDescription: card.getCard().cardDescription,
      })

      EventBus.$emit('notify', i18n.t('addNewProfile.cardAdded'), 'success')
    } catch (error) {
      if (error.response.status === 474) {
        if (card.getType() === 0) {
          EventBus.$emit(
            'notify',
            i18n.t('addNewProfile.invalidSwisspassNumber')
          )
        } else {
          EventBus.$emit('notify', i18n.t('addNewProfile.invalidSkicardNumber'))
        }
      } else {
        EventBus.$emit('notify')
      }
      EventBus.$emit('spinnerHide')
      return false
    }

    EventBus.$emit('spinnerHide')
    return true
  }
}
