import React from 'react'
import ReactUeditor from 'ifanrx-react-ueditor'
import {config, ueditorPath} from './config'
import {CATEGORY_ID} from '../../config'
import io from '../../io'
import './edui.css'

export default class Ueditor extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {value: props.value}
  }

  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return nextProps.value || null
    }
    return null
  }

  componentWillUnmount() {
    const internalUI = ['autosave', 'message']
    if (window.UE && window.UE._customizeUI) {
      for (const key in window.UE._customizeUI) {
        if (!internalUI.includes(key)) delete window.UE._customizeUI[key]
      }
    }
  }

  triggerChange = value => {
    const {onChange} = this.props
    onChange && onChange(value)
  }

  uploadImage = e => {
    const file = e.target.files[0]

    return io.base
      .getUploadFileConfig({
        filename: file.name || '',
        category_id: CATEGORY_ID,
      })
      .then(res => {
        const config = res.data
        return io.base.uploadFile({...config, file}).then(res => config.path)
      })
  }

  handlePasteImage = res => {
    return io.base.client
      .get(res, {responseType: 'blob', withCredentials: false})
      .then(res => {
        const file = res.data

        return io.base
          .getUploadFileConfig({
            filename: '',
            category_id: CATEGORY_ID,
          })
          .then(res => {
            const config = res.data
            return io.base.uploadFile({...config, file}).then(res => config.path)
          })
      })
      .catch(err => console.log(err))
  }

  pasteImageStart = res => {
    console.log('pasteImageStart', res)
  }

  pasteImageDone = res => {
    console.log('pasteImageDone', res)
  }

  render() {
    const {value} = this.state
    return (
      <ReactUeditor
        ueditorPath={ueditorPath}
        plugins={['uploadImage']}
        config={config}
        value={value}
        onChange={this.triggerChange}
        uploadImage={this.uploadImage}
        handlePasteImage={this.handlePasteImage}
        pasteImageStart={this.pasteImageStart}
        pasteImageDone={this.pasteImageDone}
      />
    )
  }
}
