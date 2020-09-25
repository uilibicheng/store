import React from 'react'
import {Link, withRouter, generatePath} from 'react-router-dom'
import {Form, Input, Button, message, Popconfirm, Select} from 'antd'

import io from '../io'
import utils from '../utils'
import {ROUTE} from '../route'
import withBaseTable from '../components/with-base-table'
import Add from '../components/add'
import {COUPON_TYPE} from '../config/constants'

const db = io.coupon
const {Option} = Select

class MerchantBannerManager extends React.Component {
  state = {
    meta: {},
    dataSource: [],
    searchName: '',
    searchType: '',
  }

  componentDidMount() {
    this.getDataSource()
  }

  get merchantId() {
    const {match} = this.props
    return match.params.merchantId
  }

  getDataSource(params = {offset: 0, limit: 20}) {
    params.where = this.searchParams
    params.orderBy = 'serial_number'

    return db
      .find({
        ...params,
      })
      .then(res => {
        const {meta, objects} = res.data
        this.setState({meta, dataSource: objects})
        return res
      })
  }

  get searchParams() {
    const {searchName, searchType} = this.state
    const params = {}
    if (searchName) {
      params.name = {$contains: searchName}
    }
    if (searchType) {
      params.type = {$eq: searchType}
    }
    params.merchant_id = {$eq: this.merchantId}
    return params
  }

  handleInput = e => {
    const {value} = e.target
    this.setState({
      searchName: value
    })
  }

  handleChangeType = value => {
    this.setState({
      searchType: value
    })
  }

  handelSearch = () => {
    this.getDataSource()
  }

  handleDeleta = id => {
    db.delete(id).then(() => {
      message.success('删除成功')
      this.getDataSource()
    })
  }

  render() {
    const columnsWidth = [60, 150, 150, 130, 100, 180]
    const columns = [
      {
        title: '序号',
        key: 'index',
        render: (val, row, index) => this.state.meta.offset + index + 1,
      },
      {
        title: '优惠券名称',
        dataIndex: 'name',
      },
      {
        title: '优惠券类型',
        dataIndex: 'type',
        render: val => COUPON_TYPE[val],
      },
      {
        title: '顺序',
        dataIndex: 'serial_number',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: val => val ? '正常' : '禁用',
      },
      {
        fixed: 'right',
        title: '操作',
        key: 'action',
        render: (val, row) => (
          <>
            <Button type='primary' ghost style={{margin: '0px 8px'}}>
              <Link to={generatePath(ROUTE.MERCHANT_COUPON_EDIT, {merchantId: this.merchantId, id: row.id})}>编辑</Link>
            </Button>
            <Popconfirm title='确认删除' onConfirm={() => this.handleDeleta(row.id)}>
              <Button type='danger' ghost>
                删除
              </Button>
            </Popconfirm>
          </>
        ),
      },
    ].map((item, index) => {
      item.width = columnsWidth[index]
      return item
    })

    const columnsScrollWidth = columnsWidth.reduce((count, i) => count + i)
    
    return (
      <>
        <div>
          <span>优惠券名称：</span>
          <Input
            style={{width: 200, marginRight: 15, marginBottom: 15, marginLeft: 10}}
            placeholder="请输入优惠券名称"
            value={this.state.searchName}
            onChange={this.handleInput}
          />
          <Select
            placeholder="请选择优惠券类型"
            value={this.state.searchType}
            onChange={this.handleChangeType}
            style={{width: 180, marginRight: 15, marginBottom: 15}}>
            <Option value="">全部</Option>
            {Object.keys(COUPON_TYPE).map(key => {
              return <Option value={Number(key)}>{COUPON_TYPE[key]}</Option>
            })}
          </Select>
          <Button type='primary' onClick={this.handelSearch}>
            查询
          </Button>
        </div>
        <div style={{marginBottom: 15}}>
          <Add path={generatePath(ROUTE.MERCHANT_COUPON_ADD, {merchantId: this.merchantId})} {...this.props} />
        </div>
        <BaseTable
          {...this.props}
          columns={columns}
          scroll={{x: columnsScrollWidth}}
          dataSource={this.state.dataSource}
          pagination={utils.pagination(this.state.meta, params => this.getDataSource(params))}
        />
      </>
    )
  }
}

const BaseTable = withBaseTable()

export default withRouter(Form.create()(MerchantBannerManager))
