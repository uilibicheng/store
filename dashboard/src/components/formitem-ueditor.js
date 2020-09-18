import React from 'react'
import ReactUeditor from 'react-ueditor'
import config from '../config/ueditor'

export default class UeditorFormItem extends React.PureComponent {
  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return nextProps.value || null
    }
    return null
  }

  constructor(props) {
    super(props)
    this.state = {
      value: props.value,
    }
  }

  triggerChange = value => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(value)
    }
  }

  render() {
    const {value} = this.state
    return (
      <ReactUeditor
        value={value}
        ueditorPath={window.UEDITOR_PATH}
        className='editor-content'
        onChange={this.triggerChange}
        config={config}
      />
    )
  }
}
