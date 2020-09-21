import React from 'react'
import {Link, generatePath} from 'react-router-dom'
import {Button, Popconfirm, message, Input} from 'antd'
import moment from 'moment'

import io from '../io'
import {ROUTE} from '../route'
import {DATE_FORMAT} from '../config/constants'
import utils from '../utils'
import withBaseTable from '../components/with-base-table'

const db = io.store
const settings_db = io.settings

export default class StoreList extends React.PureComponent {
  state = {meta: {}, dataSource: [], settingsSlogan: '', settingsId: ''}

  componentDidMount() {
    this.getDataSource()
    this.getSettings()
  }

  getSettings() {
    return settings_db.find({offset: 0, limit: 1, key: 'slogan'}).then(res => {
      const settingsSlogan = res.data.objects[0].value || ''
      const settingsId = res.data.objects[0].id
      this.setState({settingsSlogan, settingsId})
    })
  }

  handleSloganChanged = e => {
    const {value} = e.target
    this.setState({settingsSlogan: value})
  }

  handleUpdateSlogan = () => {
    const {settingsSlogan, settingsId} = this.state
    return settings_db
      .update(settingsId, {value: settingsSlogan})
      .then(res => {
        if (res.status === 200) {
          message.success('修改成功')
        }
      })
      .catch(err => {
        message.error(err)
        console.log(err)
      })
  }

  getDataSource(params = {offset: 0, limit: 20}) {
    return db.find(params).then(res => {
      const meta = res.data.meta
      const dataSource = res.data.objects
      this.setState({meta, dataSource})
      return res
    })
  }

  handleDelete = data => {
    db.delete(data.id).then(res => {
      io.userprofile.update(data.created_by, {is_store_user: false})
      message.success('删除成功')
      utils.sendAdminOperationLog(this.props, '删除')
      this.getDataSource(this.state.meta)
    })
  }

  render() {
    const columns = [
      {
        title: '商家 id',
        dataIndex: 'id',
      },
      {
        title: '商家名称',
        dataIndex: 'name',
        width: 180,
      },
      {
        title: '联系方式',
        dataIndex: 'phone',
        width: 150,
      },
      {
        title: '状态',
        dataIndex: 'is_prefection',
        render: val => (val ? '已完善资料' : <span style={{color: '#ff4d4f'}}>未完善资料</span>),
        width: 160,
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
              <Link to={generatePath(ROUTE.STORE_EDIT, {id: row.id})}>编辑</Link>
            </Button>
            <Popconfirm title='确认删除' onConfirm={() => this.handleDelete(row)}>
              <Button type='danger' ghost>
                删除
              </Button>
            </Popconfirm>
          </>
        ),
      },
    ]

    return (
      <>
        <Input
          style={{width: 300, marginRight: 15, marginBottom: 15}}
          placeholder={this.state.settingsSlogan || '建议在 10 个字以内'}
          value={this.state.settingsSlogan}
          onChange={this.handleSloganChanged}
        />
        <Button type='primary' onClick={this.handleUpdateSlogan}>
          修改首页签名
        </Button>
        <BaseTable
          {...this.props}
          columns={columns}
          dataSource={this.state.dataSource}
          pagination={utils.pagination(this.state.meta, params => this.getDataSource(params))}
        />
      </>
    )
  }
}

const BaseTable = withBaseTable()
