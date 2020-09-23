import React from 'react'
import {Link, generatePath, withRouter} from 'react-router-dom'
import {Form, Input, Button, message, Popconfirm, Switch} from 'antd'

import io from '../io'
import utils from '../utils'
import {ROUTE} from '../route'
import withBaseTable from '../components/with-base-table'
import Add from '../components/add'

const db = io.banner

class BannerSetting extends React.Component {
  state = {
    meta: {},
    dataSource: [],
    searchName: '',
  }

  componentDidMount() {
    this.getDataSource()
  }

  getDataSource(params = {offset: 0, limit: 20}) {
    params.where = this.searchParams

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
    const {searchName} = this.state
    const params = {}
    if (searchName) {
      params.name = {$contains: searchName}
    }
    return params
  }

  handleInput = e => {
    const {value} = e.target
    console.log('value', value)
    this.setState({
      searchName: value
    })
  }

  handleEditRow = data => {
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
        title: '商家名称',
        dataIndex: 'image',
        render: val => {
          return <img style={style.img} src={val} />
        }
      },
      {
        title: '人均消费/人',
        dataIndex: 'name',
      },
      {
        title: '商家类型',
        dataIndex: 'serial_number',
      },
      {
        title: '位置（所在街道）',
        dataIndex: 'is_display',
      },
      {
        title: '详细位置',
        dataIndex: 'serial_number',
      },
      {
        title: '状态',
        dataIndex: 'serial_number',
      },
      {
        fixed: 'right',
        title: '操作',
        key: 'action',
        render: (val, row) => (
          <>
            <Button type='primary' ghost style={{margin: '0px 8px'}}>
              <Link to={generatePath(ROUTE.BANNER_EDIT, {id: row.id})}>编辑</Link>
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
          <span>图片名称：</span>
          <Input
            style={{width: 220, marginRight: 15, marginBottom: 15, marginLeft: 10}}
            placeholder="请输入图片名称"
            value={this.state.searchName}
            onChange={this.handleInput}
          />
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
