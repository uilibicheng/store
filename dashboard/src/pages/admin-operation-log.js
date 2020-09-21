import React from 'react'
import moment from 'moment'
import {Form, Select, Button, message} from 'antd'

import io from '../io'
import utils from '../utils'
import {routeList} from '../route'
import withBaseTable from '../components/with-base-table'

const db = io.adminOperationLog

export default class AdminOperationLog extends React.PureComponent {
  state = {meta: {}, dataSource: [], where: null}

  componentDidMount() {
    this.getDataSource()
  }

  getDataSource(params = {offset: 0, limit: 10}) {
    const {where} = this.state
    return db
      .find({
        where,
        ...params,
      })
      .then(res => {
        const meta = res.data.meta
        const dataSource = res.data.objects
        this.setState({meta, dataSource})
        return res
      })
  }

  onChangeWhere = (where = null) => {
    this.setState({where}, this.getDataSource)
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
        title: '管理员名称',
        dataIndex: 'name',
      },
      {
        title: '管理员邮箱',
        dataIndex: 'email',
      },
      {
        title: '页面',
        dataIndex: 'page',
      },
      {
        title: '操作',
        dataIndex: 'action',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        render: val => moment.unix(val).format('YYYY-MM-DD HH:mm'),
      },
    ]

    return (
      <BaseTable
        {...this.props}
        columns={columns}
        onChangeWhere={this.onChangeWhere}
        dataSource={this.state.dataSource}
        pagination={utils.pagination(this.state.meta, params => this.getDataSource(params))}
      />
    )
  }
}

const BaseTable = withBaseTable(props => <Filter {...props} />)
class BaseFilter extends React.PureComponent {
  state = {
    adminList: [],
    pageList: [],
  }

  componentDidMount() {
    this.getAdminList()
    const pageList = routeList.map(item => this.genPageList(item))
    this.setState({pageList: [].concat.apply([], pageList)})
  }

  genPageList(route, list = []) {
    const {name, menuTitle, subRoute = []} = route
    subRoute.forEach((sub, i) => this.genPageList(sub, list))
    if (name) list.push(name)
    if (menuTitle) list.push(menuTitle)
    return list
  }

  getAdminList() {
    return io.access.find({limit: 100}).then(res => {
      const meta = res.data.meta
      const adminList = res.data.objects
      this.setState({meta, adminList})
      return res
    })
  }

  genWhere() {
    const {getFieldsValue} = this.props.form
    const formData = getFieldsValue()
    const where = io.where

    for (const key in formData) {
      const val = formData[key]
      val && where.eq(key, val)
    }

    return where.export()
  }

  handleSubmit = e => {
    setTimeout(() => {
      const where = this.genWhere()
      this.props.onChangeWhere(where)
    }, 0)
  }

  handleExport = e => {
    if (this.exporting) return
    this.exporting = true

    const exportConfig = {
      queryConfig: {
        where: this.genWhere(),
        table: 'adminOperationLog',
      },
      excelConfig: {
        cols: [
          ['name', '管理员名称'],
          ['email', '管理员邮箱'],
          ['page', '页面'],
          ['action', '操作'],
          ['created_at', '创建时间'],
        ],
      },
    }

    message.info('正在导出，导出后自动下载...')
    utils.exportData(exportConfig).finally(() => {
      utils.sendAdminOperationLog(this.props, '导出数据')
      this.exporting = false
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form
    const {adminList, pageList} = this.state

    return (
      <Form>
        {getFieldDecorator('name')(
          <Select placeholder='选择管理员' className='w180 mr12' onChange={this.handleSubmit}>
            <Select.Option value=''>全部管理员</Select.Option>
            {adminList.map(item => (
              <Select.Option key={item.id} value={item.name}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        )}

        {getFieldDecorator('page')(
          <Select placeholder='选择页面' className='w180' onChange={this.handleSubmit}>
            <Select.Option value=''>全部页面</Select.Option>
            {pageList.map((item, index) => (
              <Select.Option key={index} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        )}

        <div className='mt12'>
          <Button type='primary' onClick={this.handleExport}>
            导出数据
          </Button>
        </div>
      </Form>
    )
  }
}

const Filter = Form.create()(BaseFilter)
