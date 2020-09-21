import React from 'react'
import moment from 'moment'
import {Button, Radio, message} from 'antd'

import io from '../io'
import utils from '../utils'
import withBaseTable from '../components/with-base-table'

export default class WechatUserList extends React.PureComponent {
  state = {meta: {}, dataSource: [], where: {}}

  componentDidMount() {
    this.getDataSource()
  }

  getDataSource = (params = {offset: 0, limit: 20}) => {
    const {where} = this.state
    return io.base
      .getUserList({
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

  onChangeWhere = (where = {}) => {
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
        title: '昵称',
        dataIndex: 'nickname',
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

class Filter extends React.PureComponent {
  defaultRange = '0'

  genWhere(val) {
    val = +val
    if (!val) return null

    const now = moment().unix()
    const before = moment()
      .subtract(val, 'days')
      .startOf('day')
      .unix()

    return io.where
      .lte('created_at', now)
      .gte('created_at', before)
      .export()
  }

  handleSubmit = e => {
    const {value} = e.target
    this.setState({range: value})

    const where = this.genWhere(value)
    this.props.onChangeWhere(where)
  }

  handleExport = e => {
    if (this.exporting) return
    this.exporting = true

    const {range = this.defaultRange} = this.state
    const exportConfig = {
      queryConfig: {
        where: this.genWhere(range),
        table: 'userprofile',
      },
      excelConfig: {
        cols: [
          ['nickname', '昵称'],
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
    const rangeMap = {
      '0': '全部',
      '7': '最近 7 天',
      '30': '最近 30 天',
    }
    return (
      <>
        <Radio.Group defaultValue={this.defaultRange} buttonStyle='solid'>
          {Object.keys(rangeMap).map(key => (
            <Radio.Button key={key} value={key} onClick={this.handleSubmit}>
              {rangeMap[key]}
            </Radio.Button>
          ))}
        </Radio.Group>
        <div className='mt12'>
          <Button type='primary' onClick={this.handleExport}>
            导出数据
          </Button>
        </div>
      </>
    )
  }
}
