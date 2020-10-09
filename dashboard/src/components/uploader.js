import {Upload, Icon, Modal} from 'antd'
import React from 'react'

import {CATEGORY_ID} from '../config'
import io from '../io'

export default class Uploader extends React.Component {
  __uid = 0

  state = {
    previewVisible: false,
    previewImage: '',
    uploading: false,
    fileList: [],
  }

  componentDidMount() {
    const {value} = this.props
    if (!value) return

    const list = typeof value === 'string' ? [value] : value

    const fileList = list.map(url => ({
      url,
      uid: this.__uid++,
      status: 'done',
    }))
    this.setState({fileList})
  }

  onChange(list = []) {
    const {limit = 1, onChange = () => {}} = this.props
    list = list.map(item => item.url)
    onChange(limit > 1 ? list : list[0])
  }

  togglePreview = file => {
    const {previewVisible} = this.state
    const previewImage = file.url || ''
    this.setState({previewImage, previewVisible: !previewVisible})
  }

  onRemove = file => {
    const {fileList} = this.state
    const list = fileList.filter(item => item.uid !== file.uid)
    this.setState({fileList: list})
    this.onChange(list)
  }

  onSuccess = res => {
    const {fileList} = this.state
    const item = {
      url: res.path,
      uid: this.__uid++,
      status: 'done',
    }
    fileList.push(item)

    const list = [...fileList]
    this.setState({fileList: list})
    this.onChange(list)
  }

  onError = err => console.log('Uploader onError: ', err)

  render() {
    const {previewVisible, previewImage, fileList} = this.state
    const {limit = 1, categoryId, msg} = this.props

    const UploadButton = (
      <div>
        <Icon type={this.state.uploading ? 'loading' : 'plus'} style={{fontSize: 32, color: '#999'}} />
        <div className='ant-upload-text'>上传</div>
      </div>
    )

    return (
      <>
        <Upload
          customRequest={data => {
            const {file, onSuccess, onError} = data
            this.setState({uploading: true})
            return io.base
              .getUploadFileConfig({
                filename: file.name || '',
                category_id: categoryId || CATEGORY_ID,
              })
              .then(res => {
                const config = res.data
                return io.base.uploadFile({...config, file}).then(res => onSuccess(config))
              })
              .catch(onError)
              .finally(() => {
                this.setState({uploading: false})
              })
          }}
          accept='.png, .jpg, .jpeg, .gif'
          listType='picture-card'
          fileList={fileList}
          onSuccess={this.onSuccess}
          onError={this.onError}
          onPreview={this.togglePreview}
          onRemove={this.onRemove}
          disabled={this.props.disabled}
        >
          {fileList.length < limit && UploadButton}
        </Upload>

        {msg && <div style={{color: '#999', fontSize: 12, whiteSpace: 'pre-line', marginTop: '-25px'}}>{msg}</div>}

        <Modal visible={previewVisible} footer={null} onCancel={this.togglePreview}>
          <img style={{width: '100%', marginTop: 24}} src={previewImage} />
        </Modal>
      </>
    )
  }
}
