import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Modal} from 'antd'

import utils from '../utils'
import FormItem from '../components/form-item'
import '../assets/tailored.css'

class AddProgramModal extends React.Component {
  hideModal = () => {
    const {onCancel, form} = this.props
    form.resetFields()
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
    console.log('formData', formData)
    const title = formData.id ? '编辑商家类型' : '新增商家类型'

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
          <FormItem label='商家类型'>
            {getFieldDecorator('type', {
              initialValue: formData && formData.type ? formData.type : '',
              rules: utils.form.setRules({}),
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default withRouter(Form.create()(AddProgramModal))
