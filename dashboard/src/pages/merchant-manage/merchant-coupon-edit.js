import React from 'react'
import {withRouter} from 'react-router-dom'
import moment from 'moment'
import {Form, Input, Button, InputNumber, Select, Radio, DatePicker } from 'antd'
import io from '../../io'
import utils from '../../utils'
import FormItem from '../../components/form-item'
import Uploader from '../../components/uploader'
import Ueditor from '../../components/ueditor'
import withBaseTable from '../../components/with-base-table'
import {COUPON_TYPE} from '../../config/constants'

const { Option } = Select
const { RangePicker } = DatePicker
const db = io.coupon
const merchantDb = io.merchant

class MerchantCouponEdit extends React.Component {
  state = {
    loading: true,
    formData: {},
    meta: {},
    serviceList: [],
    selectedService: [],
    sales: {
      real_sales: 0,
      add_sales: 0,
      total_sales: 0,
    },
    price: {
      original_price: 0,
      current_price: 0,
      discount: 0,
    }
  }

  get id() {
    const {match} = this.props
    return match.params.id
  }

  get merchantId() {
    const {match} = this.props
    return match.params.merchantId
  }

  componentDidMount() {
    this.init()
  }

  init() {
    if (!this.id) return this.setState({loading: false})
    if (this.id) {
      db.get(this.id).then(res => {
        const formData = res.data || {}
        formData.period_of_validity = utils.time.momentTimeStamp(formData.period_of_validity)
        this.setState(
          {
            formData,
            loading: false,
            sales: formData.sales,
            price: formData.price,
          },
        )
      })
    }
  }

  onSelectChange = values => {
    this.setState({
      selectedService: values
    })
  }

  changeSale = (value, key) => {
    let {sales} = this.state
    sales[key] = Number(value)
    sales.total_sales = sales.real_sales + sales.add_sales
    this.setState({
      sales,
    })
  }

  changePrice = (value, key) => {
    let {price} = this.state
    price[key] = Number(value)
    if (price.original_price) {
      price.discount = Number(((price.current_price / price.original_price) * 10).toFixed(2).replace(/(0$)|(.00$)/, ''))
    }
    this.setState({
      price,
    })
  }

  handleSubmit = e => {
    const {sales, price} = this.state
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) return
      data.limit_buy_count = Number(data.limit_buy_count)
      data.limit_times = Number(data.limit_times)
      data.period_of_validity = utils.time.formatRange(data.period_of_validity)
      data.sales = sales
      data.price = price
      data.merchant_id = this.merchantId
      const req = this.id ? db.update(this.id, data) : db.create(data)
      req.then(() => {
        return this.getCouponList().then(res => {
          let data = {
            coupon_list: res
          }
          merchantDb.update(this.merchantId, data)
          this.goBack()
        })
      })
    })
  }

  getCouponList(params = {offset: 0, limit: 1000}) {
    params.where = this.searchParams

    return db
      .find({
        ...params,
      })
      .then(res => {
        const {objects} = res.data
        let arr = objects.reduce((result, item) => {
          let obj = {}
          obj.name= item.name
          obj.image= item.image
          obj.merchant_id= item.merchant_id.id
          obj.type= item.type
          obj.condition= item.condition
          obj.status= item.status
          obj.limit_times= item.limit_times
          obj.limit_buy_count= item.limit_buy_count
          obj.period_of_validity= item.period_of_validity
          obj.use_time= item.use_time
          obj.sales= item.sales
          obj.price= item.price
          obj.use_rules= item.use_rules
          obj.serial_number= item.serial_number
          result.push(obj)
          return result
        }, [])
        return arr
      })
  }

  goBack = () => this.props.history.goBack()

  render() {
    const {getFieldDecorator, getFieldValue} = this.props.form
    const {formData, loading, sales, price} = this.state

    const salesColumn = [
      {
        title: '真实销量',
        dataIndex: 'real_sales',
        render: () => {
          return <InputNumber min={0} style={{width: '100px'}} value={sales.real_sales} onChange={value => {this.changeSale(value, 'real_sales')}} />
        },
      },
      {
        title: '增加销量',
        dataIndex: 'add_sales',
        render: () => {
          return <InputNumber min={0} style={{width: '100px'}} value={sales.add_sales} onChange={value => {this.changeSale(value, 'add_sales')}} />
        },
      },
      {
        title: '总销量',
        dataIndex: 'total_sales',
        render: () => <span>{sales.total_sales}</span>
      },
    ]

    const priceColumn = [
      {
        title: '原价',
        dataIndex: 'original_price',
        render: () => {
          return <InputNumber min={0} style={{width: '100px'}} value={price.original_price} onChange={value => {this.changePrice(value, 'original_price')}} />
        },
      },
      {
        title: '现价',
        dataIndex: 'current_price',
        render: () => {
          return <InputNumber min={0} style={{width: '100px'}} value={price.current_price} onChange={value => {this.changePrice(value, 'current_price')}} />
        },
      },
      {
        title: '折扣',
        dataIndex: 'discount',
        render: () => <span>{price.discount}</span>
      },
    ]

    const couponType = getFieldValue('type')

    return loading ? null : (
      <>
        <Form onSubmit={this.handleSubmit}>
          <FormItem label='头图'>
            {getFieldDecorator('image', {
              initialValue: formData.image || '',
              rules: utils.form.setRules(),
            })(<Uploader />)}
          </FormItem>
          <FormItem label='优惠券名称'>
            {getFieldDecorator('name', {
              initialValue: formData.name || '',
              rules: utils.form.setRules(),
            })(<Input placeholder="请输入优惠券名称" />)}
          </FormItem>
          <FormItem label='类型'>
            {getFieldDecorator('type', {
              initialValue: formData.type || 1,
              rules: utils.form.setRules({type: 'number'}),
            })(
              <Select placeholder="请选择优惠券类型">
                {Object.keys(COUPON_TYPE).map(key => {
                  return <Option value={Number(key)}>{COUPON_TYPE[key]}</Option>
                })}
              </Select>
            )}
          </FormItem>
          {couponType !== 1 ? null :
            <FormItem label='条件'>
              <span style={{marginRight: '10px'}}>满</span>
              <Form.Item style={{display: 'inline-block', marginBottom: 0}}>
                {getFieldDecorator('condition.satify_num', {
                  initialValue: (formData.condition && formData.condition.satify_num) || null,
                  rules: utils.form.setRules({type: 'number'}),
                })(<InputNumber min={0} step={1} />)}
              </Form.Item>
              <span style={{marginLeft: '10px', marginRight: '10px'}}>减</span>
              <Form.Item style={{display: 'inline-block', marginBottom: 0}}>
                {getFieldDecorator('condition.reduce_num', {
                  initialValue: (formData.condition && formData.condition.reduce_num) || null,
                  rules: utils.form.setRules({type: 'number'}),
                })(<InputNumber min={0} step={1} />)}
              </Form.Item>
            </FormItem>
          }
          {couponType !== 2 ? null :
            <FormItem label='条件'>
              {getFieldDecorator('condition.discount', {
                initialValue: (formData.condition && formData.condition.discount) || '',
                rules: utils.form.setRules(),
              })(<Input type="number" style={{width: '250px'}} placeholder="请输入折扣数" addonAfter="折" />)}
            </FormItem>
          }
          {couponType !== 3 ? null :
            <FormItem label='条件'>
              {getFieldDecorator('condition.limit', {
                initialValue: (formData.condition && formData.condition.limit) || null,
                rules: utils.form.setRules(),
              })(<Input type="number" style={{width: '250px'}} placeholder="请输入代金额度" />)}
            </FormItem>
          }
          <FormItem label='已售'>
            <BaseTable
              style={{width: '450px'}}
              columns={salesColumn}
              dataSource={[sales]}
              pagination={false}
            />
          </FormItem>
          <FormItem label='价格'>
            <BaseTable
              style={{width: '450px'}}
              columns={priceColumn}
              dataSource={[price]}
              pagination={false}
            />
          </FormItem>
          <FormItem label='最大可叠加'>
            {getFieldDecorator('limit_times', {
              initialValue: String(formData.limit_times) || '',
              rules: utils.form.setRules(),
            })(<Input type="number" style={{width: '280px'}} placeholder="请设置用户可叠加张数" addonAfter="单位：张" />)}
          </FormItem>
          <FormItem label='可购买张数'>
            {getFieldDecorator('limit_buy_count', {
              initialValue: String(formData.limit_buy_count) || '',
              rules: utils.form.setRules(),
            })(<Input type="number" style={{width: '280px'}} placeholder="请设置用户可购买张数" addonAfter="单位：张" />)}
          </FormItem>
          <FormItem label='有效期'>
            {getFieldDecorator('period_of_validity', {
              initialValue: formData.period_of_validity || [],
              rules: utils.form.setRules({type: 'array'}),
            })(
              <RangePicker format="YYYY-MM-DD" showTime={false} />
            )}
          </FormItem>
          <FormItem label='使用时间'>
            {getFieldDecorator('use_time', {
              initialValue: formData.use_time || [],
              rules: utils.form.setRules(),
            })(<Input placeholder="请输入使用时间，如：10:00-23:00" />)}
          </FormItem>
          <FormItem label='使用规则'>
            {getFieldDecorator('use_rules', {
              initialValue: formData.use_rules || '',
              rules: utils.form.setRules({required: false}),
            })(<Ueditor />)}
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
          <FormItem label='显示顺序'>
            {getFieldDecorator('serial_number', {
              initialValue: formData && formData.serial_number ? formData.serial_number : 1,
              rules: utils.form.setRules({type: 'number'}),
            })(<InputNumber min={1} step={1} />)}
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

export default withRouter(Form.create()(MerchantCouponEdit))
