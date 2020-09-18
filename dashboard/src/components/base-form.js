import React from 'react'
import {Form} from 'antd'

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 9},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 15},
  },
}
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 15,
      offset: 9,
    },
  },
}
const FormLabelLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 9,
      offset: 0,
    },
  },
}

export function FormItem(props) {
  return <Form.Item {...formItemLayout} {...props} />
}

export function TailFormItem(props) {
  return <Form.Item {...tailFormItemLayout} {...props} />
}

export function FormLabel(props) {
  return <Form.Item {...FormLabelLayout} {...props} />
}
