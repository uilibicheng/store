import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Select , Modal, DatePicker} from 'antd'
import moment from 'moment'

import {LEVEL, DATE_FORMAT} from '../config/constants'
import utils from '../utils'
import FormItem from '../components/form-item'
import Uploader from '../components/uploader'
import '../assets/tailored.css'

const {Option} = Select
class EditUserModal extends React.Component {
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
      params.deadline = moment(params.deadline).endOf('day').unix()
      onSubmit && onSubmit(params)
    })
  }

  render() {
    const {
      visible,
      formData,
      form: {getFieldDecorator, getFieldValue},
    } = this.props
    const title = formData.id ? '编辑用户' : '新增用户'

    const level = getFieldValue('vip_level')

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
        <FormItem label='头像'>
            {getFieldDecorator('avatar', {
              initialValue: formData.avatar || '',
              rules: utils.form.setRules(),
            })(<Uploader disabled={true} />)}
          </FormItem>
          <FormItem label='用户名'>
            {getFieldDecorator('nickname', {
              initialValue: formData && formData.nickname ? formData.nickname : '',
              rules: utils.form.setRules(),
            })(<Input disabled />)}
          </FormItem>
          <FormItem label='手机号'>
            {getFieldDecorator('phone', {
              initialValue: formData && formData.phone ? formData.phone : '',
              rules: utils.form.setRules(),
            })(<Input />)}
          </FormItem>
          <FormItem label='会员等级'>
            {getFieldDecorator('vip_level', {
              initialValue: formData && formData.vip_level ? formData.vip_level : '0',
              rules: utils.form.setRules(),
            })(
              <Select style={{width: '200px'}} placeholder="请选择会员等级">
                {
                  Object.keys(LEVEL).map(key => {
                    return <Option value={key}>{LEVEL[key]}</Option>
                  })
                }
              </Select>
            )}
          </FormItem>
          {
            (!level || level === '0') ? null :
            <FormItem label='会员期限'>
              {getFieldDecorator('deadline', {
                initialValue: formData && formData.deadline ? formData.deadline : null,
                rules: utils.form.setRules({type: 'object'}),
              })(
                <DatePicker
                  format={DATE_FORMAT} />
              )}
            </FormItem>
          }
        </Form>
      </Modal>
    )
  }
}

export default withRouter(Form.create()(EditUserModal))
