import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, InputNumber, Modal, Radio} from 'antd'

import utils from '../utils'
import FormItem from '../components/form-item'
import Uploader from '../components/uploader'
import '../assets/tailored.css'

class EditMerchantBannerModal extends React.Component {
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
    const title = formData.id ? '编辑轮播图' : '新增轮播图'

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
          <FormItem label='轮播图'>
            {getFieldDecorator('image', {
              initialValue: formData.image || '',
              rules: utils.form.setRules(),
            })(<Uploader />)}
          </FormItem>
          <FormItem label='轮播图名称'>
            {getFieldDecorator('name', {
              initialValue: formData.name || '',
              rules: utils.form.setRules({}),
            })(<Input />)}
          </FormItem>
          <FormItem label='显示顺序'>
            {getFieldDecorator('serial_number', {
              initialValue: formData.serial_number || 1,
              rules: utils.form.setRules({type: 'number'}),
            })(<InputNumber min={1} step={1} />)}
          </FormItem>
          <FormItem label='状态'>
            {getFieldDecorator('is_display', {
              initialValue: formData.hasOwnProperty('is_display') ? formData.is_display : true,
              rules: utils.form.setRules({type: 'boolean'}),
            })(
              <Radio.Group>
                <Radio value={true}>显示</Radio>
                <Radio value={false}>隐藏</Radio>
              </Radio.Group>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default withRouter(Form.create()(EditMerchantBannerModal))
