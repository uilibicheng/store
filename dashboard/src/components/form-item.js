import React from 'react'
import {Form} from 'antd'

export default function FormItem(props) {
  const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 16},
  }

  const hiddenStyle = {
    height: 0,
    margin: 0,
    pading: 0,
    overflow: 'hidden',
  }

  formItemLayout.wrapperCol.offset = props.label ? 0 : 6
  const style = props.hidden ? hiddenStyle : {}
  return <Form.Item {...formItemLayout} {...props} style={style} />
}
