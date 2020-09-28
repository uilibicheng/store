import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, InputNumber, Switch, Select, Cascader, Radio } from 'antd'

import io from '../../io'
import utils from '../../utils'
import FormItem from '../../components/form-item'
import Uploader from '../../components/uploader'
import Ueditor from '../../components/ueditor'
import Position from '../../config/position'
import withBaseTable from '../../components/with-base-table'

const { Option } = Select;
const db = io.merchant
const typeDb = io.merchantType
const serviceDb = io.restaurantService

class BannerEdit extends React.Component {
  state = {
    loading: true,
    formData: {},
    meta: {},
    merchantList: [],
    searchName: '',
    merchantType: [],
    serviceList: [],
    selectedService: [],
    halfYearSales: {
      real_sales: 0,
      add_sales: 0,
      total_sales: 0,
    }
  }

  get id() {
    const {match} = this.props
    return match.params.id
  }

  componentDidMount() {
    this.init()
    this.getMerchantTypeList()
    this.getServiceList()
  }

  init() {
    if (!this.id) return this.setState({loading: false})
    if (this.id) {
      db.get(this.id).then(res => {
        const formData = res.data || {}
        formData.location = [formData.provice, formData.city, formData.county]
        this.setState(
          {
            formData,
            loading: false,
            halfYearSales: formData.half_year_sales,
            selectedService: formData.service_list,
          },
        )
      })
    }
  }

  getMerchantTypeList(params = {offset: 0, limit: 100}) {
    return typeDb.find(params).then(res => {
      const merchantType = res.data.objects
      this.setState({merchantType})
    })
  }

  getServiceList(params = {offset: 0, limit: 100}) {
    return serviceDb.find(params).then(res => {
      const serviceList = res.data.objects
      this.setState({serviceList})
    })
  }

  onSelectChange = values => {
    this.setState({
      selectedService: values
    })
  }

  changeSale = (value, key) => {
    let {halfYearSales} = this.state
    halfYearSales[key] = Number(value)
    halfYearSales.total_sales = halfYearSales.real_sales + halfYearSales.add_sales
    this.setState({
      halfYearSales,
    })
  }

  handleSubmit = e => {
    const {formData, halfYearSales, selectedService} = this.state
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) return
      data.half_year_sales = halfYearSales
      data.service_list = selectedService || []
      data.provice = data.location[0] || ''
      data.city = data.location[1] || ''
      data.county = data.location[2] || ''
      delete data.location
      const req = this.id ? db.update(this.id, data) : db.create(data)
      req.then(() => {
        this.goBack()
      })
    })
  }

  goBack = () => this.props.history.goBack()

  render() {
    const {getFieldDecorator} = this.props.form
    const {formData, loading, merchantType, serviceList, selectedService, halfYearSales} = this.state

    const serviceColumn = [
      {
        title: '服务内容',
        dataIndex: 'content',
      },
    ]
    const rowSelection = {
      selectedRowKeys: selectedService,
      onChange: this.onSelectChange,
    }

    const salesColumn = [
      {
        title: '真实销量',
        dataIndex: 'real_sales',
        render: () => {
          return <InputNumber min={0} style={{width: '100px'}} value={halfYearSales.real_sales} onChange={value => {this.changeSale(value, 'real_sales')}} />
        },
      },
      {
        title: '增加销量',
        dataIndex: 'add_sales',
        render: () => {
          return <InputNumber min={0} style={{width: '100px'}} value={halfYearSales.add_sales} onChange={value => {this.changeSale(value, 'add_sales')}} />
        },
      },
      {
        title: '总销量',
        dataIndex: 'total_sales',
        render: () => <span>{halfYearSales.total_sales}</span>
      },
    ]

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
            })(<Input placeholder="请输入商家名称" />)}
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
          <FormItem label='商家类型'>
            {getFieldDecorator('merchant_type_id', {
              initialValue: formData.merchant_type_id ? formData.merchant_type_id.id : '',
              rules: utils.form.setRules(),
            })(
              <Select placeholder="请选择商家类型" showSearch optionFilterProp="children">
                {merchantType.map(item => {
                  return <Option value={item.id}>{item.type}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem label='商家位置'>
            {getFieldDecorator('location', {
              initialValue: formData.location || [],
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
            {getFieldDecorator('address', {
              initialValue: formData.address || '',
              rules: utils.form.setRules(),
            })(<Input placeholder="请选择详细地址" />)}
          </FormItem>
          <FormItem label='位置经度'>
            {getFieldDecorator('longitude', {
              initialValue: formData.longitude || '',
              rules: utils.form.setRules(),
            })(<Input placeholder="请输入位置经度" />)}
          </FormItem>
          <FormItem label='位置纬度'>
            {getFieldDecorator('laitude', {
              initialValue: formData.laitude || '',
              rules: utils.form.setRules(),
            })(<Input placeholder="请输入位置纬度" />)}
          </FormItem>
          <FormItem label='联系电话'>
            {getFieldDecorator('contact_number', {
              initialValue: formData.contact_number || '',
              rules: utils.form.setRules(),
            })(<Input placeholder="请输入联系电话" />)}
          </FormItem>
          <FormItem label='营业时间'>
            {getFieldDecorator('opening_time', {
              initialValue: formData.opening_time || [],
              rules: utils.form.setRules(),
            })(<Input placeholder="请输入营业时间，如：10:00-23:00" />)}
          </FormItem>
          <FormItem label='半年销量'>
            <BaseTable
              style={{width: '450px'}}
              columns={salesColumn}
              dataSource={[halfYearSales]}
              pagination={false}
            />
          </FormItem>
          <FormItem label='餐厅服务'>
            <BaseTable
              style={{width: '350px'}}
              rowClassName={() => 'editable-row'}
              columns={serviceColumn}
              rowSelection={rowSelection}
              dataSource={serviceList}
              pagination={false}
            />
          </FormItem>
          <FormItem label='状态'>
            {getFieldDecorator('status', {
              initialValue: formData.hasOwnProperty('status') ? formData.status : 1,
              rules: utils.form.setRules({type: 'number'}),
            })(
              <Radio.Group>
                <Radio value={1}>正常</Radio>
                <Radio value={0}>禁用</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label='商家详情'>
            {getFieldDecorator('details', {
              initialValue: formData.details || '',
              rules: utils.form.setRules({required: false}),
            })(<Ueditor />)}
          </FormItem>
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

const BaseTable = withBaseTable()

export default withRouter(Form.create()(BannerEdit))
