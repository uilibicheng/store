import React from 'react'
import {Link, generatePath} from 'react-router-dom'
import {Button, Popconfirm, message} from 'antd'
import moment from 'moment'

import io from '../io'
import {ROUTE} from '../route'
import {DATE_FORMAT} from '../config/constants'
import utils from '../utils'
import withBaseTable from '../components/with-base-table'

const db = io.tailored

export default class TailoredList extends React.PureComponent {
  state = {meta: {}, dataSource: []}

  componentDidMount() {
    this.getDataSource()
  }

  getDataSource(params = {offset: 0, limit: 20}) {
    return db.find(params).then(res => {
      const meta = res.data.meta
      const dataSource = res.data.objects
      this.setState({meta, dataSource})
      return res
    })
  }

  handleDelete = id => {
    Promise.all([this.findStore(id), this.findOrder(id)]).then(res => {
      const storeList = res[0]
      const orderList = res[1]
      if (storeList.length) {
        return message.error('已关联商家，不允许删除')
      }
      if (orderList.length) {
        return message.error('已关联订单，不允许删除')
      }
      db.delete(id).then(() => {
        message.success('删除成功')
        utils.sendAdminOperationLog(this.props, '删除')
        this.getDataSource(this.state.meta)
      })
    })
  }

  findStore = id => {
    return io.store.find({where: {tailored_id: {$eq: id}}}).then(res => {
      return res.data.objects
    })
  }

  findOrder = id => {
    return io.order.find({where: {tailored_id: {$eq: id}}}).then(res => {
      return res.data.objects
    })
  }

  render() {
    const columns = [
      {
        title: '序号',
        key: 'index',
        width: 80,
        render: (val, row, index) => this.state.meta.offset + index + 1,
      },
      {
        title: '量体表名称',
        dataIndex: 'name',
        width: 300,
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        render: val => moment.unix(val).format(DATE_FORMAT),
      },
      {
        title: '操作',
        key: 'action',
        render: (val, row) => (
          <>
            <Button type='primary' ghost style={{margin: '0px 8px'}}>
              <Link to={generatePath(ROUTE.TAILORED_EDIT, {id: row.id})}>编辑</Link>
            </Button>
            <Popconfirm title='确认删除？' onConfirm={() => this.handleDelete(row.id)}>
              <Button type='danger' ghost>
                删除
              </Button>
            </Popconfirm>
          </>
        ),
      },
    ]

    return (
      <BaseTable
        {...this.props}
        columns={columns}
        dataSource={this.state.dataSource}
        pagination={utils.pagination(this.state.meta, params => this.getDataSource(params))}
      />
    )
  }
}

const BaseTable = withBaseTable('', props => <Header {...props} />)

function Header(props) {
  return (
    <Button type='primary' onClick={() => props.history.push(ROUTE.TAILORED_ADD)}>
      新增量体表
    </Button>
  )
}
