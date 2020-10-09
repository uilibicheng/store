import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, message, Popconfirm, Select} from 'antd'
import moment from 'moment'
import {DATE_FORMAT, LEVEL} from '../../config/constants'

import io from '../../io'
import utils from '../../utils'
import EditUserModal from '../../components/edit-user-modal'
import withBaseTable from '../../components/with-base-table'

const db = io.userprofile
const {Option} = Select

const SECOND = 86400

class UserList extends React.Component {
  state = {
    meta: {},
    dataSource: [],
    searchName: '',
    searchPhone: '',
    searchLevel: '',
    visible: false,
    formData: {},
  }

  componentDidMount() {
    this.getDataSource()
  }

  getDataSource(params = {offset: 0, limit: 10}) {
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
    const {searchName, searchPhone, searchLevel} = this.state
    const params = {}
    if (searchName) {
      params.nickname = {$contains: searchName}
    }
    if (searchPhone) {
      params.phone = {$contains: searchPhone}
    }
    if (searchLevel) {
      params.vip_level = {$eq: searchLevel}
    }
    return params
  }

  handleDisplayChange(key, data) {
    const {meta} = this.state
    data[key] = !data[key]
    db.update(data.id, data).then(() => {
      message.success('更新成功')
      this.getDataSource({offset: meta.offset, limit: meta.limit})
    })
  }

  handleInput = (e, key) => {
    const {value} = e.target
    this.setState({
      [key]: value
    })
  }

  handleChangeLevel = value => {
    this.setState({
      searchLevel: value
    })
  }

  handleReset = () => {
    this.setState({
      searchName: '',
      searchPhone: '',
      searchLevel: '',
    }, () => {
      this.handleSearch()
    })
  }

  handleSearch = () => {
    this.getDataSource()
  }

  handleEditRow = data => {
    this.setState({
      formData: data
    })
    this.handleShowAddModal()
  }

  handleShowAddModal = () => {
    this.setState({
      visible: true,
    })
  }

  handleHideModal = () => {
    this.setState({
      visible: false,
      formData: {}
    })
  }

  handleSaveUserData = data => {
    const {formData} = this.state
    const req = formData.id ? db.update(formData.id, data) : db.create(data)
    let title = formData.id ? '更新成功' : '添加成功'
    req.then(() => {
      message.success(title)
      this.handleHideModal()
      this.getDataSource()
    })
  }

  handleDeleta = id => {
    db.delete(id).then(() => {
      message.success('删除成功')
      this.getDataSource()
    })
  }

  render() {
    const nowDate = moment().endOf('day').unix()
    const {visible, formData} = this.state
    const columnsWidth = [60, 110, 150, 120, 180, 100, 120, 180]
    const columns = [
      {
        title: '序号',
        key: 'index',
        render: (val, row, index) => this.state.meta.offset + index + 1,
      },
      {
        title: '头像',
        dataIndex: 'avatar',
        render: val => {
          return <img style={{width: 50, height: 50, objectFit: 'contain'}} src={val} />
        }
      },
      {
        title: '用户名',
        dataIndex: 'nickname',
      },
      {
        title: '手机号',
        dataIndex: 'phone',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        render: val => moment(val * 1000).format(DATE_FORMAT)
      },
      {
        title: '会员等级',
        dataIndex: 'vip_level',
        render: val => LEVEL[val],
      },
      {
        title: '会员期限',
        dataIndex: 'deadline',
        render: val => {
          if (!val) {
            return ''
          }
          if (moment().isAfter(val * 1000)) {
            let day = Math.round((nowDate - val) / SECOND)
            return `已过期${day}天`
          } else {
            let day = Math.round((val - nowDate) / SECOND)
            return `${day}天`
          }
        }
      },
      {
        fixed: 'right',
        title: '操作',
        key: 'action',
        render: (val, row) => (
          <>
            <Button type='primary' ghost style={{margin: '0px 8px'}} onClick={() => this.handleEditRow(row)}>
              编辑
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
          <span>用户名：</span>
          <Input
            style={{width: 220, marginRight: 15, marginBottom: 15, marginLeft: 10}}
            placeholder="请输入用户名"
            value={this.state.searchName}
            onChange={e => {this.handleInput(e, 'searchName')}}
          />
          <span>手机号：</span>
          <Input
            style={{width: 220, marginRight: 15, marginBottom: 15, marginLeft: 10}}
            placeholder="请输入手机号"
            value={this.state.searchPhone}
            onChange={e => {this.handleInput(e, 'searchPhone')}}
          />
          <Button type='primary' onClick={this.handleSearch}>
            查询
          </Button>
          <Button type='primary' style={{marginLeft: 15}} onClick={this.handleReset}>
            重置
          </Button>
        </div>
        <div style={{marginBottom: 15}}>
          <span>会员等级：</span>
          <Select style={{width: '200px'}} value={this.state.searchLevel} onChange={this.handleChangeLevel}>
            <Option value="">全部</Option>
            {
              Object.keys(LEVEL).map(key => {
                return <Option value={key}>{LEVEL[key]}</Option>
              })
            }
          </Select>
        </div>
        <BaseTable
          {...this.props}
          columns={columns}
          scroll={{x: columnsScrollWidth}}
          dataSource={this.state.dataSource}
          pagination={utils.pagination(this.state.meta, params => this.getDataSource(params))}
        />
        {!visible ? null
          : <EditUserModal
          visible={visible}
          onCancel={this.handleHideModal}
          formData={formData || {}}
          onSubmit={this.handleSaveUserData}
        />}
      </>
    )
  }
}

const BaseTable = withBaseTable()

export default withRouter(Form.create()(UserList))
