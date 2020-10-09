import React from 'react'
import {Link, withRouter, generatePath} from 'react-router-dom'
import {Form, Input, Button, message, Popconfirm} from 'antd'

import io from '../../io'
import utils from '../../utils'
import {ROUTE} from '../../route'
import withBaseTable from '../../components/with-base-table'
import Add from '../../components/add'

const db = io.packages

class MerchantPackageManage extends React.Component {
  state = {
    meta: {},
    dataSource: [],
    searchName: '',
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
    params.merchant_id = {$eq: this.merchantId}
    return params
  }

  handleInput = e => {
    const {value} = e.target
    this.setState({
      searchName: value
    })
  }

  handleSearch = () => {
    this.getDataSource()
  }

  handleDeleta = id => {
    db.delete(id).then(() => {
      message.success('删除成功')
      this.getDataSource()
    })
  }

  render() {
    const columnsWidth = [60, 150, 150, 100, 180]
    const columns = [
      {
        title: '序号',
        key: 'index',
        render: (val, row, index) => this.state.meta.offset + index + 1,
      },
      {
        title: '图片',
        dataIndex: 'image',
        render: val => {
          return <img style={{width: 100, height: 50, objectFit: 'contain'}} src={val} />
        }
      },
      {
        title: '套餐名称',
        dataIndex: 'name',
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
              <Link to={generatePath(ROUTE.MERCHANT_PACKAGE_EDIT, {merchantId: this.merchantId, id: row.id})}>编辑</Link>
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
          <span>套餐名称：</span>
          <Input
            style={{width: 200, marginRight: 15, marginBottom: 15, marginLeft: 10}}
            placeholder="请输入套餐名称"
            value={this.state.searchName}
            onChange={this.handleInput}
          />
          <Button type='primary' onClick={this.handleSearch}>
            查询
          </Button>
        </div>
        <div style={{marginBottom: 15}}>
          <Add path={generatePath(ROUTE.MERCHANT_PACKAGE_ADD, {merchantId: this.merchantId})} {...this.props} />
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

export default withRouter(Form.create()(MerchantPackageManage))
