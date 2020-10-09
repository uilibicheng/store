import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, InputNumber, Switch} from 'antd'

import io from '../../io'
import utils from '../../utils'
import FormItem from '../../components/form-item'
import Uploader from '../../components/uploader'
import withBaseTable from '../../components/with-base-table'

const db = io.banner
const merchantDb = io.merchant

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
    this.getDataSource()
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

  getDataSource(params = {offset: 0, limit: 20}) {
    params.where = this.searchParams
    return merchantDb.find(params).then(res => {
      const meta = res.data.meta
      const merchantList = res.data.objects
      this.setState({meta, merchantList})
      return res
    })
  }

  get searchParams() {
    const {searchName} = this.state
    const params = {}
    if (searchName) {
      params.name = {$contains: searchName}
    }
    return params
  }

  handleInput = e => {
    const {value} = e.target
    this.setState({
      searchName: value
    })
  }

  handleSearch = () => {

  }

  handleSubmit = e => {
    const {formData} = this.state
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, data) => {
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
    const {getFieldDecorator, getFieldValue} = this.props.form
    const {formData, loading} = this.state

    return loading ? null : (
      <>
        <Form onSubmit={this.handleSubmit}>
          <FormItem label='轮播图'>
            {getFieldDecorator('image', {
              initialValue: formData.image || '',
              rules: utils.form.setRules(),
            })(<Uploader />)}
          </FormItem>
          <FormItem label='轮播图名称'>
            {getFieldDecorator('name', {
              initialValue: formData.name || '',
              rules: utils.form.setRules(),
            })(<Input />)}
          </FormItem>
          <FormItem label='显示顺序'>
            {getFieldDecorator('serial_number', {
              initialValue: formData.serial_number || '1',
              rules: utils.form.setRules({type: 'number'}),
            })(<InputNumber min={1} step={1} />)}
          </FormItem>
          <FormItem label='状态'>
            {getFieldDecorator('is_display', {
              initialValue: formData.hasOwnProperty('is_display') ? formData.is_display : true,
              valuePropName: 'checked',
              rules: utils.form.setRules({type: 'boolean'}),
            })(
              <Switch />
            )}
          </FormItem>
          {/* <FormItem label='关联商家'>
            {getFieldDecorator('merchant_id', {
              initialValue: formData.is_display || true,
              rules: utils.form.setRules({required: false}),
            })(
              <MerchantTable
                merchantList={this.state.merchantList}
                meta={this.state.meta}
                searchName={this.state.searchName}
                handleInput={this.handleInput}
                getDataSource={params => this.getDataSource(params)} />
            )}
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

const BaseTable = withBaseTable()

function MerchantTable(props) {
  const columnsWidth = [60, 160, 200, 160,]
  const columns = [
    {
      title: '序号',
      key: 'index',
      render: (val, row, index) => this.state.meta.offset + index + 1,
    },
    {
      title: '商家名称',
      dataIndex: 'name',
    },
    {
      title: '商家类型',
      dataIndex: 'merchant_type_id',
    },
    {
      title: '详细位置',
      dataIndex: 'address',
    },
  ].map((item, index) => {
    item.width = columnsWidth[index]
    return item
  })
  const columnsScrollWidth = columnsWidth.reduce((count, i) => count + i)

  return (
    <>
      <div>
        <Input
          style={{width: 220, marginRight: 15, marginBottom: 15, marginLeft: 10}}
          placeholder="请输入商家名称搜索"
          value={props.searchName}
          onChange={props.handleInput}
        />
        <Button type='primary' onClick={props.getDataSource}>
          查询
        </Button>
      </div>
      <BaseTable
        {...props}
        columns={columns}
        scroll={{x: columnsScrollWidth}}
        dataSource={props.merchantList}
        pagination={utils.pagination(props.meta, params => props.getDataSource(params))}
      />
    </>
  )
}

export default withRouter(Form.create()(BannerEdit))
