import React from 'react'
import {Upload, Icon, message} from 'antd'
import io from '../io'
import {_} from 'i18n-utils'

export default class UploaderFormItem extends React.PureComponent {
  static defaultProps = {
    limit: 1,
    maxSize: 1024 * 1024,
  }
  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return nextProps.value || null
    }
    return null
  }

  constructor(props) {
    super(props)
    this.state = {
      imageUrl: [],
    }
  }

  componentDidMount() {
    const {value} = this.props
    if (!value) return
    const imageUrl = value.map((i, index) => ({
      uid: index,
      status: 'done',
      url: i,
    }))
    this.setState({imageUrl})
  }

  getBase64(img, callback) {
    if (!img) return Promise.reject(new Error('without img'))
    if (typeof img === 'string') return Promise.resolve(img)
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.addEventListener('load', () => resolve(reader.result))
      reader.readAsDataURL(img)
    })
  }

  isValidImg = file => file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')

  isValidSize = file => file.size < this.props.maxSize

  validFile = file => {
    if (!this.isValidImg(file)) {
      message.error(_('请选择正确的文件'))
      return false
    }
    if (!this.isValidSize(file)) {
      message.error(_('图片大小不能超过 200 K'))
      return false
    }
    return true
  }

  uploadFile(file) {
    const {categoryId} = this.props
    let uploadConfig
    const configData = {}
    if (categoryId) {
      configData.category_id = categoryId
    }
    return io
      .getUploadFileConfig(configData)
      .then(res => {
        uploadConfig = res.data
        return io.uploadFile({...uploadConfig, file})
      })
      .then(() => uploadConfig)
  }

  triggerChange = file => {
    if (!file || !this.validFile(file)) return false
    const {beforeUpload, onChange} = this.props
    this.uploadFile(file).then(config => {
      const {file_link} = config
      const imageUrl = [{url: file_link}]
      this.setState({imageUrl})
      if (onChange) {
        onChange(imageUrl)
      }
    })
    return beforeUpload && beforeUpload(file)
  }

  triggerListChange = file => {
    if (!file || !this.validFile(file)) return false
    const {beforeUpload, onChange} = this.props
    const {imageUrl: oldUrlList} = this.state
    const uid = file.uid || (oldUrlList.length ? oldUrlList[oldUrlList.length - 1].uid + 1 : 0)
    this.uploadFile(file).then(config => {
      const {file_link} = config
      const imageUrl = oldUrlList.concat({
        uid,
        url: file_link,
        status: 'done',
      })

      this.setState({imageUrl})
      if (onChange) {
        onChange(imageUrl)
      }
    })
    return beforeUpload && beforeUpload(file)
  }

  onRemoveListItem = file => {
    const {onChange} = this.props
    const {imageUrl: oldUrlList} = this.state
    const imageUrl = oldUrlList.filter(i => i.uid !== file.uid)
    this.setState({imageUrl}, () => onChange && onChange(imageUrl))
  }

  render() {
    const {imageUrl} = this.state
    const {limit, msg} = this.props
    const uploadButton = <Icon type='plus' style={{margin: 0, textAlign: 'center', display: 'inline-block'}} />
    return (
      <React.Fragment>
        {limit === 1 ? (
          <Upload
            {...this.props}
            beforeUpload={this.triggerChange}
            className={`formitem-uploader ${this.props.className}`}
          >
            {imageUrl.length ? (
              <img src={imageUrl[0].url} alt='uploader' style={{maxWidth: '100%', maxHeight: '100%', margin: 'auto'}} />
            ) : (
              uploadButton
            )}
          </Upload>
        ) : (
          <Upload
            {...this.props}
            beforeUpload={this.triggerListChange}
            fileList={imageUrl}
            onRemove={this.onRemoveListItem}
            className={`formitem-uploader ${this.props.className}`}
          >
            {imageUrl.length < limit && uploadButton}
          </Upload>
        )}
        {msg && <div style={{clear: 'both', color: '#999', fontSize: 12}}>{msg}</div>}
      </React.Fragment>
    )
  }
}
