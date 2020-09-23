import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, InputNumber, Switch, Select, Cascader, TimePicker } from 'antd'

import io from '../io'
import utils from '../utils'
import FormItem from '../components/form-item'
import Uploader from '../components/uploader'
import Position from '../config/position'
import withBaseTable from '../components/with-base-table'
import { format } from 'prettier'

const db = io.merchant

class BannerEdit extends React.Component {
  state = {
    loading: true,
    formData: {},
    meta: {},
    merchantList: [],
    searchName: '',
  }

  get id() {
    const {match} = this.props
    return match.params.id
  }

  componentDidMount() {
    this.init()
  }

  init() {
    if (!this.id) return this.setState({loading: false})
    if (this.id) {
      db.get(this.id).then(res => {
        const formData = res.data || {}
        this.setState(
          {
            formData,
            loading: false,
          },
        )
      })
    }
  }

  handleSelectedPosition = () => {

  }

  handleSubmit = e => {
    const {formData} = this.state
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, data) => {
      console.log('err', err, data, formData)
      if (err) return
      utils.form.formatFields(data)
      data.serial_number = Number(data.serial_number)
      const req = this.id ? db.update(this.id, data) : db.create(data)
      req.then(() => {
        this.goBack()
      })
    })
  }

  goBack = () => this.props.history.goBack()

  render() {
    const {getFieldDecorator} = this.props.form
    const {formData, loading} = this.state

    return loading ? null : (
      <>
        <Form onSubmit={this.handleSubmit}>
          <FormItem label='商家 logo'>
            {getFieldDecorator('logo', {
              initialValue: formData.logo || '',
              rules: utils.form.setRules(),
            })(<Uploader />)}
          </FormItem>
          <FormItem label='商家名称'>
            {getFieldDecorator('name', {
              initialValue: formData.name || '',
              rules: utils.form.setRules(),
            })(<Input />)}
          </FormItem>
          <FormItem label='人均消费'>
            {getFieldDecorator('consumption_person', {
              initialValue: formData.consumption_person || 0,
              rules: utils.form.setRules({type: 'number'}),
            })(
              <Select placeholder="请选择人均消费水平">
                <option value={0}>100以下</option>
                <option value={1}>100-200</option>
                <option value={2}>200-300</option>
                <option value={3}>300以上</option>
              </Select>
            )}
          </FormItem>
          <FormItem label='商家位置'>
            {getFieldDecorator('location', {
              initialValue: formData.location || [],
              valuePropName: 'checked',
              rules: utils.form.setRules({type: 'array'}),
            })(
              <Cascader
                style={{width: '250px'}}
                options={Position}
                expandTrigger="hover"
                showSearch
                placeholder="请选择商家所在位置"
              />,
            )}
          </FormItem>
          <FormItem label='详细地址'>
            {getFieldDecorator('name', {
              initialValue: formData.name || '',
              rules: utils.form.setRules(),
            })(<Input />)}
          </FormItem>
          <FormItem label='位置经度'>
            {getFieldDecorator('name', {
              initialValue: formData.name || '',
              rules: utils.form.setRules(),
            })(<Input />)}
          </FormItem>
          <FormItem label='位置纬度'>
            {getFieldDecorator('name', {
              initialValue: formData.name || '',
              rules: utils.form.setRules(),
            })(<Input />)}
          </FormItem>
          <FormItem label='联系电话'>
            {getFieldDecorator('name', {
              initialValue: formData.name || '',
              rules: utils.form.setRules(),
            })(<Input />)}
          </FormItem>
          {/* <FormItem label='营业时间'>
            {getFieldDecorator('opening_time', {
              initialValue: formData.opening_time || [],
              rules: utils.form.setRules(),
            })(
              <TimePicker />
            )}
          </FormItem> */}
          {/* <FormItem label='半年销量'>
            
          </FormItem> */}
          <FormItem>
            <Button onClick={this.goBack}>取消</Button>
            <Button type='primary' htmlType='submit'>
              保存
            </Button>
          </FormItem>
        </Form>
      </>
    )
  }
}

export default withRouter(Form.create()(BannerEdit))
