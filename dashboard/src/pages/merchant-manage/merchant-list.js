import React from 'react'
import {Link, generatePath, withRouter} from 'react-router-dom'
import {Form, Input, Button, message, Popconfirm, Select} from 'antd'

import io from '../../io'
import utils from '../../utils'
import {ROUTE} from '../../route'
import withBaseTable from '../../components/with-base-table'
import Add from '../../components/add'

const db = io.merchant
const typeDb = io.merchantType
const Option = Select.Option

const CONSUMPTION_PERSON = {
  0: '100以下',
  1: '100-200',
  2: '200-300',
  3: '300以上',
}

class BannerSetting extends React.Component {
  state = {
    meta: {},
    dataSource: [],
    searchName: '',
    searchType: '',
    merchantTypeList: [],
  }

  componentDidMount() {
    this.getDataSource()
    this.getMerchantTypeList()
  }

  getMerchantTypeList(params = {offset: 0, limit: 500}) {
    return typeDb
      .find({
        ...params,
      })
      .then(res => {
        const {objects} = res.data
        this.setState({merchantTypeList: objects})
      })
  }

  getDataSource(params = {offset: 0, limit: 10}) {
    params.where = this.searchParams
    params.expand = 'merchant_type_id'

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
      params.merchant_type = {$contains: searchType}
    }
    return params
  }

  handleInput = e => {
    const {value} = e.target
    this.setState({
      searchName: value
    })
  }

  handleChange = value => {
    this.setState({
      searchType: value
    })
  }

  handleDeleta = id => {
    db.delete(id).then(() => {
      message.success('删除成功')
      this.getDataSource()
    })
  }

  render() {
    const columnsWidth = [60, 120, 110, 100, 180, 150, 60, 350]
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
        title: '人均消费/人',
        dataIndex: 'consumption_person',
        render: val => CONSUMPTION_PERSON[val],
      },
      {
        title: '商家类型',
        dataIndex: 'merchant_type_id',
        render: val => val.type,
      },
      {
        title: '位置',
        dataIndex: 'provice',
        render: (val, row) => row.provice + '-' + row.city + '-' + row.county,
      },
      {
        title: '详细位置',
        dataIndex: 'address',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: val => (val === 1 ? '正常' : '禁用'),
      },
      {
        fixed: 'right',
        title: '操作',
        key: 'action',
        render: (val, row) => (
          <>
            <Button type='primary' ghost style={{margin: '0px 8px'}}>
              <Link to={generatePath(ROUTE.MERCHANT_EDIT, {id: row.id})}>编辑</Link>
            </Button>
            <Button type='primary' ghost style={{margin: '0px 8px'}}>
              <Link to={generatePath(ROUTE.MERCHANT_BANNER_MANAGE, {merchantId: row.id})}>图片管理</Link>
            </Button>
            <Button type='primary' ghost style={{margin: '0px 8px'}}>
              <Link to={generatePath(ROUTE.MERCHANT_COUPON_MANAGE, {merchantId: row.id})}>优惠券</Link>
            </Button>
            <Button type='primary' ghost style={{margin: '0px 8px'}}>
              <Link to={generatePath(ROUTE.MERCHANT_MENU_MANAGE, {merchantId: row.id})}>菜品管理</Link>
            </Button>
            <Button type='primary' ghost style={{margin: '0px 8px'}}>
              <Link to={generatePath(ROUTE.MERCHANT_PACKAGE_MANAGE, {merchantId: row.id})}>套餐管理</Link>
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
      if (columnsWidth[index]) {
        item.width = columnsWidth[index]
      }
      return item
    })

    const columnsScrollWidth = columnsWidth.reduce((count, i) => count + i)
    
    return (
      <>
        <div>
          <span>商家名称：</span>
          <Input
            style={{width: 220, marginRight: 15, marginBottom: 15, marginLeft: 10}}
            placeholder="请输入商家名称"
            value={this.state.searchName}
            onChange={this.handleInput}
          />
          <Select
            style={{width: 150, marginRight: 15, marginBottom: 15, marginLeft: 10}}
            placeholder="请选择商家类型"
            showSearch
            allowClear
            optionFilterProp="children"
            value={this.state.searchType}
            onChange={this.handleChange}>
            <Option value="">全部</Option>
            {this.state.merchantTypeList.map((item, index) => {
              return <Option value={item.type} key={index}>{item.type}</Option>
            })}
          </Select>
          <Button type='primary' onClick={() => {this.getDataSource()}}>
            查询
          </Button>
        </div>
        <div style={{marginBottom: 15}}>
          <Add path={generatePath(ROUTE.MERCHANT_ADD)} {...this.props} />
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

export default withRouter(Form.create()(BannerSetting))

const style = {
  img: {
    width: 80,
    height: 80,
    objectFit: 'contain'
  }
}
