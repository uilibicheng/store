import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, InputNumber, Select, Radio, DatePicker } from 'antd'
import io from '../../io'
import utils from '../../utils'
import FormItem from '../../components/form-item'
import Uploader from '../../components/uploader'
import Ueditor from '../../components/ueditor'
import withBaseTable from '../../components/with-base-table'
import SelectMenuModal from '../../components/select-menu-modal'

const { RangePicker } = DatePicker
const db = io.packages

class MerchantPackageEdit extends React.Component {
  state = {
    loading: true,
    formData: {},
    meta: {},
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
    },
    menuList: [],
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
            menuList: formData.menu,
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

  handleShowModal = () => {
    this.setState({
      visible: true
    })
  }

  handleHideModal = () => {
    this.setState({
      visible: false,
    })
  }

  handleSaveMenu = data => {
    let menuList = data.reduce((result, item) => {
      let obj = {}
      obj.name = item. name
      obj.image = item. image
      obj.merchant_id = item. merchant_id
      obj.id = item. id
      obj.original_price = item. original_price
      obj.current_price = item. current_price
      obj.discount = item. discount
      obj.is_recommend = item. is_recommend
      result.push(obj)
      return result
    }, [])
    this.setState({
      menuList,
    })
  }

  handleSubmit = e => {
    const {sales, price, menuList} = this.state
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) return
      data.period_of_validity = utils.time.formatRange(data.period_of_validity)
      data.sales = sales
      data.price = price
      data.merchant_id = this.merchantId
      data.menu = menuList
      const req = this.id ? db.update(this.id, data) : db.create(data)
      req.then(() => {
        this.goBack()
      })
    })
  }

  goBack = () => this.props.history.goBack()

  render() {
    const {getFieldDecorator, getFieldValue} = this.props.form
    const {formData, loading, sales, price, menuList, visible} = this.state

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

    const menuColumn = [
      {
        title: '菜品名称',
        dataIndex: 'name',
      },
      {
        title: '原价',
        dataIndex: 'original_price',
      },
      {
        title: '现价',
        dataIndex: 'current_price',
      },
    ]

    return loading ? null : (
      <>
        <Form onSubmit={this.handleSubmit}>
          <FormItem label='头图'>
            {getFieldDecorator('image', {
              initialValue: formData.image || '',
              rules: utils.form.setRules(),
            })(<Uploader />)}
          </FormItem>
          <FormItem label='名称'>
            {getFieldDecorator('name', {
              initialValue: formData.name || '',
              rules: utils.form.setRules(),
            })(<Input placeholder="请输入套餐名称" />)}
          </FormItem>
          <FormItem label='绑定菜品'>
            <Button type='primary' onClick={this.handleShowModal}>绑定菜品</Button>
            {!menuList.length ? null :
              <BaseTable
                style={{width: '450px'}}
                columns={menuColumn}
                dataSource={menuList}
                pagination={false}
              />
            }
          </FormItem>
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
          <FormItem label='套餐描述'>
            {getFieldDecorator('description', {
              initialValue: formData.description || [],
              rules: utils.form.setRules(),
            })(<Input placeholder="请输入套餐描述" />)}
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
        {!visible ? null
          : <SelectMenuModal
          visible={visible}
          onCancel={this.handleHideModal}
          menuList={menuList}
          onSubmit={this.handleSaveMenu}
        />}
      </>
    )
  }
}

const BaseTable = withBaseTable()

export default withRouter(Form.create()(MerchantPackageEdit))
