import React from 'react'
import {Link, generatePath} from 'react-router-dom'
import {Button, Popconfirm, message} from 'antd'
import moment from 'moment'

import io from '../io'
import {ROUTE} from '../route'
import {DATE_FORMAT} from '../config/constants'
import utils from '../utils'
import withBaseTable from '../components/with-base-table'

const db = io.access

export default class AdminList extends React.PureComponent {
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
    db.delete(id).then(res => {
      message.success('删除成功')
      utils.sendAdminOperationLog(this.props, '删除')
      this.getDataSource(this.state.meta)
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
        title: '邮箱',
        dataIndex: 'email',
        width: 300,
      },
      {
        title: '用户名称',
        dataIndex: 'name',
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
              <Link to={generatePath(ROUTE.ADMIN_EDIT, {id: row.id})}>编辑</Link>
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

const BaseTable = withBaseTable(props => <Header {...props} />)

function Header(props) {
  return (
    <>
      <p>第一步：超级管理员进入【运营后台成员管理】页面，新增运营后台成员。</p>
      <p>
        第二步：返回本运营后台【新增管理员】并设置权限。【新增管理员】填写的邮箱，必须是运营后台成员的邮箱，否则无法享有对应的权限。
      </p>
      <Button type='primary' style={{marginRight: '20px'}}>
        <a href='https://cloud.minapp.com/dashboard/#/enterprise/team/' rel='noopener noreferrer' target='_blank'>
          运营后台成员管理
        </a>
      </Button>
      <Button type='primary' onClick={() => props.history.push(ROUTE.ADMIN_ADD)}>
        新增管理员
      </Button>
    </>
  )
}
