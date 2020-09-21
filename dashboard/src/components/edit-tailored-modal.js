import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, Select, Modal, Radio, Icon} from 'antd'

import utils from '../utils'
import {TAILORED_TYPE, CLOTHES_TYPE_NAME, DATA_TYPE_NAME, DATA_TYPE} from '../config/constants'
import FormItem from '../components/form-item'
import '../assets/tailored.css'

const RadioGroup = Radio.Group
const Option = Select.Option
const formItemLayout = {
  wrapperCol: {span: 20, offset: 3},
}

let id = 0

class EditTailoredModal extends React.Component {
  componentDidUpdate(prevProps) {
    const {
      fieldData,
      visible,
      form: {setFieldsValue},
    } = this.props
    const isPrevEmpty = !Object.keys(prevProps.fieldData).length
    if (!visible) return
    if (isPrevEmpty && Object.keys(fieldData).length) {
      const arr = []
      if (fieldData.options && fieldData.options.length) {
        fieldData.options.forEach((item, index) => {
          id = index
          arr.push(index)
        })
      }
      setFieldsValue({
        keys: arr.length ? arr : [id],
      })
    }
  }

  hideModal = () => {
    const {
      onCancel,
      form: {resetFields},
    } = this.props
    id = 0
    onCancel()
    resetFields()
  }

  handleAddAddOption = () => {
    const {form} = this.props
    const keys = form.getFieldValue('keys')
    const nextKeys = keys.concat(++id)
    form.setFieldsValue({
      keys: nextKeys,
    })
  }

  handleRemoveOption = index => {
    const {form} = this.props
    const keys = form.getFieldValue('keys')
    form.setFieldsValue({
      keys: keys.filter(key => key !== index),
    })
  }

  handleSubmit = e => {
    const {onSubmit, fieldData, form} = this.props
    e.preventDefault()
    form.validateFieldsAndScroll((err, data) => {
      if (err) return
      const isEdit = Object.keys(fieldData).length
      if (this.checkNameRepeat(data)) {
        return form.setFields({
          name: {
            value: data.name,
            errors: [new Error('该字段重复，请重新输入')],
          },
        })
      }
      const params = this.formatData(data)
      id = 0
      onSubmit && onSubmit(params, isEdit)
      form.resetFields()
    })
  }

  checkNameRepeat = data => {
    const {dataSource, fieldData} = this.props
    const isEdit = Object.keys(fieldData).length

    if (isEdit && fieldData.name === data.name) return false

    const arr = dataSource.find(item => {
      if (data.category === item.category) {
        if (data.clothes_type) {
          return data.clothes_type === item.clothes_type && item.name === data.name
        }
        return item.name === data.name
      }
    })
    return !!arr
  }

  formatData = data => {
    if (data.options && data.options.length) {
      data.options = data.options.filter(item => {
        return !!item
      })
    }
    if (data.type === DATA_TYPE.SELECT) {
      data.options.forEach(item => {
        let child = item.child_options
        child = child.replace(/，/g, ',')
        item.child_options = child.split(',')
      })
    }
    const params = {}
    Object.keys(data).forEach(key => {
      if (key !== 'keys') {
        params[key] = data[key]
      }
    })
    return params
  }

  render() {
    const {
      visible,
      fieldData,
      form: {getFieldDecorator, getFieldValue},
    } = this.props
    getFieldDecorator('keys', {initialValue: [id]})
    const keys = getFieldValue('keys')

    return (
      <Modal
        className='tailored-modal'
        visible={visible}
        title={Object.keys(fieldData).length ? '编辑字段' : '新增字段'}
        okText='ok'
        cancelText='cancel'
        onCancel={this.hideModal}
        onOk={this.handleSubmit}
      >
        <Form>
          <FormItem label='所属分类'>
            {getFieldDecorator('category', {
              initialValue: fieldData.category || '',
              rules: utils.form.setRules({message: '请选择分类'}),
            })(
              <Select style={{width: 250}} placeholder='选择分类'>
                <Option value={TAILORED_TYPE.BODY}>身体数据</Option>
                <Option value={TAILORED_TYPE.TAILORING}>成衣数据</Option>
              </Select>
            )}
          </FormItem>
          {getFieldValue('category') === TAILORED_TYPE.TAILORING ? (
            <FormItem label='类型'>
              {getFieldDecorator('clothes_type', {
                initialValue: fieldData.clothes_type || '',
                rules: utils.form.setRules({message: '请选择衣服类型'}),
              })(
                <Select style={{width: 250}} placeholder='请选择衣服类型'>
                  {Object.keys(CLOTHES_TYPE_NAME).map(key => {
                    return (
                      <Option value={key} key={key}>
                        {CLOTHES_TYPE_NAME[key]}
                      </Option>
                    )
                  })}
                </Select>
              )}
            </FormItem>
          ) : null}
          <FormItem label='字段名称'>
            {getFieldDecorator('name', {
              initialValue: fieldData.name || '',
              rules: utils.form.setRules({message: '请输入字段名称'}),
            })(<Input placeholder='请输入字段名称' style={{width: 250}} />)}
          </FormItem>
          <FormItem {...formItemLayout}>
            {getFieldDecorator('type', {
              initialValue: fieldData.type || 'text',
              rules: utils.form.setRules(),
            })(
              <RadioGroup>
                {Object.keys(DATA_TYPE_NAME).map(key => {
                  return (
                    <Radio value={key} key={key}>
                      {DATA_TYPE_NAME[key]}
                    </Radio>
                  )
                })}
              </RadioGroup>
            )}
          </FormItem>
          {getFieldValue('type') === DATA_TYPE.TEXTAREA ? null : (
            <>
              {keys.map((item, index) => {
                return (
                  <div className='option-wrap' key={index}>
                    <FormItem label={index === 0 ? '名称' : ''} key={index} className='option-item'>
                      {getFieldDecorator(`options[${item}].name`, {
                        initialValue:
                          fieldData.options && fieldData.options[item] && fieldData.options[item].name
                            ? fieldData.options[item].name
                            : '',
                        rules: utils.form.setRules(),
                      })(<Input style={{width: 250}} placeholder='请输入名称' />)}
                      {keys.length > 1 ? (
                        <Icon
                          style={style.iconButton}
                          type='minus-circle-o'
                          disabled={length === 1}
                          onClick={() => this.handleRemoveOption(item)}
                        />
                      ) : null}
                    </FormItem>
                    {getFieldValue('type') === DATA_TYPE.SELECT ? (
                      <FormItem label={index === 0 ? '选项' : ''} className='option-item'>
                        {getFieldDecorator(`options[${item}].child_options`, {
                          initialValue:
                            fieldData.options && fieldData.options[item] && fieldData.options[item].child_options
                              ? fieldData.options[item].child_options.join(',')
                              : '',
                          rules: utils.form.setRules(),
                        })(<Input style={{width: 250}} placeholder='请输入选项，以,隔开' />)}
                      </FormItem>
                    ) : null}
                  </div>
                )
              })}
              <FormItem>
                <Button type='dashed' onClick={this.handleAddAddOption}>
                  + 新增
                </Button>
              </FormItem>
            </>
          )}
        </Form>
      </Modal>
    )
  }
}

const style = {
  iconButton: {
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
    marginLeft: '15px',
    transform: 'translateY(4px)',
  },
}

export default withRouter(Form.create()(EditTailoredModal))
