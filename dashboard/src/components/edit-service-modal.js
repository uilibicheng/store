import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, InputNumber, Modal} from 'antd'

import utils from '../utils'
import FormItem from '../components/form-item'
import '../assets/tailored.css'

class AddProgramModal extends React.Component {
  hideModal = () => {
    const {onCancel} = this.props

    onCancel()
  }

  handleSubmit = e => {
    const {onSubmit} = this.props
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) return
      const params = {}
      Object.keys(data).forEach(key => {
        if (key !== 'keys') {
          params[key] = data[key]
        }
      })
      params.serial_number = Number(params.serial_number)
      onSubmit && onSubmit(params)
    })
  }

  render() {
    const {
      visible,
      formData,
      form: {getFieldDecorator},
    } = this.props
    console.log('formData', formData)
    const title = formData.id ? '编辑服务' : '新增服务'

    return (
      <Modal
        className='tailored-modal'
        visible={visible}
        title={title}
        okText='确定'
        cancelText='取消'
        onCancel={this.hideModal}
        onOk={this.handleSubmit}
      >
        <Form>
          <FormItem label='显示顺序'>
            {getFieldDecorator('serial_number', {
              initialValue: formData && formData.serial_number ? formData.serial_number : 1,
              rules: utils.form.setRules({type: 'number'}),
            })(<InputNumber min={1} step={1} />)}
          </FormItem>
          <FormItem label='服务内容'>
            {getFieldDecorator('content', {
              initialValue: formData && formData.content ? formData.content : '',
              rules: utils.form.setRules(),
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default withRouter(Form.create()(AddProgramModal))
