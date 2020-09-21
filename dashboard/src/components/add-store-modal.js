import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, Modal, Radio, Icon} from 'antd'

import utils from '../utils'
import {URL_TYPE, URL_TYPE_NAME} from '../config/constants'
import FormItem from '../components/form-item'
import '../assets/tailored.css'

const RadioGroup = Radio.Group

let id = 0

class AddStoreModal extends React.Component {
  componentDidUpdate(prevProps) {
    const {
      visible,
      storeData,
      form: {setFieldsValue},
    } = this.props
    if (!prevProps.visible && visible) {
      const arr = []
      if (storeData.options && storeData.options.length) {
        storeData.options.forEach((item, index) => {
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
    const {onCancel} = this.props
    onCancel()
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
      params.options = params.options.reduce((result, item) => {
        if (item.url && item.label) {
          result.push(item)
        }
        return result
      }, [])
      onSubmit && onSubmit(params)
    })
  }

  render() {
    const {
      visible,
      storeData,
      form: {getFieldDecorator, getFieldValue},
    } = this.props
    getFieldDecorator('keys', {initialValue: [id]})
    const keys = getFieldValue('keys')

    return (
      <Modal
        className='tailored-modal'
        visible={visible}
        title='新增商家信息'
        okText='ok'
        cancelText='cancel'
        onCancel={this.hideModal}
        onOk={this.handleSubmit}
      >
        <Form>
          <FormItem label='商家名称'>
            {getFieldDecorator('name', {
              initialValue: storeData && storeData.name ? storeData.name : '',
              rules: utils.form.setRules({required: false}),
            })(<Input />)}
          </FormItem>
          <FormItem label='联系方式'>
            {getFieldDecorator('phone', {
              initialValue: storeData && storeData.phone ? storeData.phone : '',
              rules: utils.form.setRules({required: false}),
            })(<Input />)}
          </FormItem>
          {keys.map((item, index) => {
            return (
              <div key={item}>
                <FormItem label={'类型' + item} className='option-item'>
                  {getFieldDecorator(`options[${item}].type`, {
                    initialValue:
                      storeData.options && storeData.options[item] && storeData.options[item].type
                        ? storeData.options[item].type
                        : URL_TYPE.LINK,
                  })(
                    <RadioGroup>
                      {Object.keys(URL_TYPE_NAME).map(key => {
                        return (
                          <Radio value={key} key={key}>
                            {URL_TYPE_NAME[key]}
                          </Radio>
                        )
                      })}
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem label='跳转标题'>
                  {getFieldDecorator(`options[${item}].label`, {
                    initialValue:
                      storeData.options && storeData.options[item] && storeData.options[item].label
                        ? storeData.options[item].label
                        : '',
                  })(<Input style={{width: 250}} placeholder='请输入标题' />)}
                  {keys.length > 1 ? (
                    <Icon
                      style={style.iconButton}
                      type='minus-circle-o'
                      disabled={length === 1}
                      onClick={() => this.handleRemoveOption(item)}
                    />
                  ) : null}
                </FormItem>
                <FormItem label={getFieldValue(`options[${item}].type`) === URL_TYPE.LINK ? '链接' : 'appid'}>
                  {getFieldDecorator(`options[${item}].url`, {
                    initialValue:
                      storeData.options && storeData.options[item] && storeData.options[item].url
                        ? storeData.options[item].url
                        : '',
                  })(
                    <Input
                      style={{width: 250}}
                      placeholder={
                        getFieldValue(`options[${item}].type`) === URL_TYPE.LINK ? '请输入链接 ' : '请输入 appid'
                      }
                    />
                  )}
                </FormItem>
              </div>
            )
          })}
          <FormItem>
            <Button type='dashed' onClick={this.handleAddAddOption}>
              + 新增
            </Button>
          </FormItem>
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

export default withRouter(Form.create()(AddStoreModal))
