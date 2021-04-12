import { peInstance, shopInstance } from '../utils/axiosInstance'
import FileModel from './FileModel'

export default class FileUploadService {
  /**
   * upload a new product image
   * @param file
   * @returns {Promise<FileModel>}
   */
  async uploadImage(file) {
    let uploadedFile = new FileModel()
    if (file) {
      let formData = new FormData()
      formData.append('image', file)
      /* global EventBus axios i18n */
      EventBus.$emit('spinnerShow', i18n.t('singleProductView.uploadingImage'))

      await shopInstance()
        .post('/admin/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          EventBus.$emit('spinnerHide')
          uploadedFile = new FileModel(response.data)
        })
        .catch((error) => {
          EventBus.$emit('spinnerHide')

          // create apropriate error msg
          let originalError = error.response.data.error
          let errorMsg = originalError.includes('Unsupported format')
            ? i18n.t('imageUploader.wrongFileType')
            : originalError
          EventBus.$emit(
            'notify',
            i18n.t('singleProductView.uploadingFailed') + ': ' + errorMsg
          )
        })
    }
    return Promise.resolve(uploadedFile)
  }

  /**
   * uploads an excel with products
   * @returns {Promise<boolean>}
   */
  async importProductsFromExcel(file) {
    if (file) {
      let formData = new FormData()
      formData.append('import', file)
      /* global EventBus axios i18n */
      EventBus.$emit('spinnerShow', i18n.t('fileUploadService.processingExcel'))

      try {
        await peInstance.post('/admin/imports', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        EventBus.$emit(
          'notify',
          i18n.t('fileUploadService.importSucceed'),
          'success'
        )
        return true
      } catch (error) {
        EventBus.$emit('notify', error.response.data.error)
        return false
      } finally {
        EventBus.$emit('spinnerHide')
      }
    } else {
      return false
    }
  }
}
