import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, InputNumber, Modal} from 'antd'

import utils from '../utils'
import FormItem from '../components/form-item'
import Uploader from '../components/uploader'
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
      onSubmit && onSubmit(params)
    })
  }

  render() {
    const {
      visible,
      formData,
      form: {getFieldDecorator},
    } = this.props
    const title = formData.id ? '编辑栏目' : '新增栏目'

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
          <FormItem label='图标'>
            {getFieldDecorator('icon', {
              initialValue: formData.icon || '',
              rules: utils.form.setRules(),
            })(<Uploader />)}
          </FormItem>
          <FormItem label='栏目名称'>
            {getFieldDecorator('name', {
              initialValue: formData && formData.name ? formData.name : '',
              rules: utils.form.setRules(),
            })(<Input />)}
          </FormItem>
          <FormItem label='角标内容'>
            {getFieldDecorator('corner_content', {
              initialValue: formData && formData.corner_content ? formData.corner_content : '',
              rules: utils.form.setRules({required: false}),
            })(<Input />)}
          </FormItem>
          <FormItem label='显示顺序'>
            {getFieldDecorator('serial_number', {
              initialValue: formData && formData.serial_number ? formData.serial_number : 1,
              rules: utils.form.setRules({type: 'number'}),
            })(<InputNumber min={1} step={1} />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default withRouter(Form.create()(AddProgramModal))
