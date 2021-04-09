import ExternalUrlModel from './ExternalUrlModel'
import ExternalUrlRoleModel from './ExternalUrlRoleModel'

export default class ExternalUrlService {
  parseApiData(externalUrls) {
    let result = []
    for (let i = 0; i < externalUrls.length; i++) {
      let externalUrl = externalUrls[i].externalUrl || externalUrls[i]
      if (externalUrl.externalUrl2roles !== undefined) {
        let externalUrlRole = []
        for (let i = 0; i < externalUrl.externalUrl2roles.length; i++) {
          let externalUrl2role =
            externalUrl.externalUrl2roles[i] || externalUrl.externalUrl2roles[i]
          externalUrlRole.push(new ExternalUrlRoleModel(externalUrl2role))
        }
        externalUrl.externalUrlRoles = externalUrlRole
      }
      result.push(new ExternalUrlModel(externalUrl))
    }
    return result
  }

  async getExternalUrlsForUserByType(type, slug = null) {
    EventBus.$emit('spinnerShow')
    try {
      let response = await axios.get(
        this.getBaseUrl(slug) + 'user/externalUrls/' + type
      )
      let result = await this.parseApiData(response.data)
      return Promise.resolve(result)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('powerBi.couldNotBeLoaded'))
      return Promise.resolve([])
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  async getAllExternalUrlsForRegionByType(type, slug = null) {
    EventBus.$emit('spinnerShow')
    try {
      let response = await axios.get(
        this.getBaseUrl(slug) + 'externalUrls/' + type
      )
      let result = await this.parseApiData(response.data)
      return Promise.resolve(result)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('powerBi.couldNotBeLoaded'))
      return Promise.resolve([])
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  async addExternalUrls(model, slug = null) {
    EventBus.$emit('spinnerShow')
    try {
      let response = await axios.post(
        this.getBaseUrl(slug) + 'externalUrl',
        model,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      let result = await this.parseApiData(response.data)
      return Promise.resolve(result)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('powerBi.couldNotBeSaved'))
      return Promise.resolve([])
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  async updateExternalUrls(model, slug = null) {
    EventBus.$emit('spinnerShow')
    try {
      let response = await axios.put(
        this.getBaseUrl(slug) + 'externalUrl/' + model.id,
        model,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      return Promise.resolve(response)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('powerBi.couldNotBeSaved'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  async deleteExternalUrls(id, slug = null) {
    EventBus.$emit('spinnerShow')
    try {
      let response = await axios.delete(
        this.getBaseUrl(slug) + 'externalUrl/' + id
      )
      return Promise.resolve(response)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('powerBi.couldNotBeDeleted'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  async connectExternalUrlToRole(eUrlId, roleId, slug = null) {
    EventBus.$emit('spinnerShow')
    try {
      let response = await axios.post(
        this.getBaseUrl(slug) + 'externalUrl/' + eUrlId + '/role/' + roleId,
        {
          activate: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      return Promise.resolve(response)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('powerBi.couldNotBeSaved'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  async disconnectExternalUrlToRole(eUrlId, roleId, slug = null) {
    EventBus.$emit('spinnerShow')
    try {
      let response = await axios.post(
        this.getBaseUrl(slug) + 'externalUrl/' + eUrlId + '/role/' + roleId,
        {
          activate: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      return Promise.resolve(response)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('powerBi.couldNotBeSaved'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  getBaseUrl(slug = null) {
    return slug
      ? store.getters.getCurrentDestinationInstance().getShopApi(true, slug)
      : store.getters.getCurrentDestinationInstance().getShopApi()
  }
}
