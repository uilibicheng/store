import React from 'react'
import {generatePath, withRouter} from 'react-router-dom'
import {Form, Input, Button, message, Popconfirm, Switch} from 'antd'

import io from '../../io'
import utils from '../../utils'
import {ROUTE} from '../../route'
import withBaseTable from '../../components/with-base-table'
import EditServiceModal from '../../components/edit-service-modal'
import Add from '../../components/add'

const db = io.restaurantService

class RestaurantService extends React.Component {
  state = {
    meta: {},
    dataSource: [],
    searchName: '',
    visible: false,
    formData: {},
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
      params.content = {$contains: searchName}
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

  handleInput = e => {
    const {value} = e.target
    this.setState({
      searchName: value
    })
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

  handleSaveService = data => {
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
    const {visible, formData} = this.state
    const columnsWidth = [80, 150, 100, 180]
    const columns = [
      {
        title: '序号',
        key: 'index',
        render: (val, row, index) => this.state.meta.offset + index + 1,
      },
      {
        title: '服务内容',
        dataIndex: 'content',
      },
      {
        title: '显示顺序',
        dataIndex: 'serial_number',
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
          <span>服务内容：</span>
          <Input
            style={{width: 220, marginRight: 15, marginBottom: 15, marginLeft: 10}}
            placeholder="请输入服务内容"
            value={this.state.searchName}
            onChange={this.handleInput}
          />
          <Button type='primary' onClick={() => {this.getDataSource()}}>
            查询
          </Button>
        </div>
        <div style={{marginBottom: 15}}>
          <Button type='primary' onClick={this.handleShowAddModal}>
            新增
          </Button>
        </div>
        <BaseTable
          {...this.props}
          columns={columns}
          scroll={{x: columnsScrollWidth}}
          dataSource={this.state.dataSource}
          pagination={utils.pagination(this.state.meta, params => this.getDataSource(params))}
        />
        <EditServiceModal
          visible={visible}
          onCancel={this.handleHideModal}
          formData={formData || {}}
          onSubmit={this.handleSaveService}
        />
      </>
    )
  }
}

const BaseTable = withBaseTable()

export default withRouter(Form.create()(RestaurantService))

const style = {
  img: {
    width: 80,
    height: 80,
    objectFit: 'contain'
  }
}
