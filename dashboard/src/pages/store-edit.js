import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, Icon, Select} from 'antd'

import io from '../io'
import utils from '../utils'
import {FILE_GROUP_ID} from '../config/constants'
import FormItem from '../components/form-item'
import Uploader from '../components/uploader'

const db = io.store
const Option = Select.Option

let id = 0

class StoreEdit extends React.Component {
  state = {
    loading: true,
    formData: {},
    tailoredList: [],
    addressList: [],
  }

  get id() {
    const {match} = this.props
    return match.params.id
  }

  componentDidMount() {
    this.init()
    this.getTailoredList()
  }

  init() {
    if (!this.id) return this.setState({loading: false, addressList: [id]})
    db.get(this.id).then(res => {
      const formData = res.data
      this.setState({
        formData,
        loading: false,
        addressList: formData.address,
      })
    })
  }

  getTailoredList(params = {offset: 0, limit: 500}) {
    return io.tailored.find(params).then(res => {
      const tailoredList = res.data.objects
      this.setState({tailoredList})
      return res
    })
  }

  handleAddAddress = () => {
    const addressList = this.state.addressList.concat(++id)
    this.setState({
      addressList,
    })
  }

  handleRemoveAddress = index => {
    const {form} = this.props
    const {addressList} = this.state
    const address = [...form.getFieldValue('address')]
    const arr = [...addressList]
    arr.splice(index, 1)
    address.splice(index, 1)
    this.setState({
      addressList: arr,
    })
    form.setFieldsValue({
      address,
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) return
      utils.form.formatFields(data)
      data.is_prefection = true
      const params = this.getValidFormData(data)
      const req = this.id ? db.update(this.id, params) : db.create(params)
      req.then(() => utils.sendAdminOperationLog(this.props)).then(this.goBack)
    })
  }

  getValidFormData = data => {
    const {logo, qrcode, tailored_id, address} = data
    if (address && address.length) {
      data.address = address.reduce((result, current) => {
        if (current) {
          result.push(current)
        }
        return result
      }, [])
    }
    if (!(data.address && data.address.length) || !data.logo || !data.qrcode || !data.tailored_id) {
      data.is_prefection = false
    }
    if (!logo) {
      data.logo = ''
    }
    if (!qrcode) {
      data.qrcode = ''
    }
    if (!tailored_id) {
      delete data.tailored_id
    }
    return data
  }

  goBack = () => this.props.history.goBack()

  render() {
    const {getFieldDecorator} = this.props.form
    const {formData, loading, addressList, tailoredList} = this.state

    return loading ? null : (
      <Form onSubmit={this.handleSubmit}>
        <FormItem label='商家名称'>
          {getFieldDecorator('name', {
            initialValue: formData.name || '',
            rules: utils.form.setRules({message: '请填写商家名称'}),
          })(<Input />)}
        </FormItem>
        <FormItem label='联系方式'>
          {getFieldDecorator('phone', {
            initialValue: formData.phone || '',
            rules: utils.form.setRules({message: '请填写联系方式'}),
          })(<Input />)}
        </FormItem>
        {addressList.map((item, index) => {
          return (
            <FormItem label={index === 0 ? '商家地址' : ''} key={index}>
              {getFieldDecorator(`address[${index}]`, {
                initialValue: formData.address ? formData.address[index] : '',
              })(<Input />)}
              {addressList.length > 1 ? (
                <Icon
                  style={style.iconButton}
                  type='minus-circle-o'
                  disabled={length === 1}
                  onClick={() => this.handleRemoveAddress(index)}
                />
              ) : null}
            </FormItem>
          )
        })}
        <FormItem>
          <Button type='dashed' onClick={this.handleAddAddress}>
            + 新增地址
          </Button>
        </FormItem>
        <FormItem label='商家 logo'>
          {getFieldDecorator('logo', {
            initialValue: formData.logo || '',
          })(
            <Uploader categoryId={FILE_GROUP_ID.STORE} msg='支持 jpg、png，图片大小不超过 200 k，建议像素为：375*281' />
          )}
        </FormItem>
        <FormItem label='公众号二维码'>
          {getFieldDecorator('qrcode', {
            initialValue: formData.qrcode || '',
          })(<Uploader categoryId={FILE_GROUP_ID.STORE} />)}
        </FormItem>
        <FormItem label='关联量体表'>
          {getFieldDecorator('tailored_id', {
            initialValue: formData.tailored_id ? formData.tailored_id.id : '',
          })(
            <Select placeholder='请选择量体表'>
              {tailoredList.map(item => {
                return (
                  <Option value={item.id} key={item.id}>
                    {item.name}
                  </Option>
                )
              })}
            </Select>
          )}
        </FormItem>
        <FormItem>
          <Button onClick={this.goBack}>取消</Button>
          <Button type='primary' htmlType='submit'>
            保存
          </Button>
        </FormItem>
      </Form>
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

export default withRouter(Form.create()(StoreEdit))
