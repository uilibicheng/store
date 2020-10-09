import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, message, Popconfirm, Switch} from 'antd'

import io from '../../io'
import utils from '../../utils'
import EditMenuModal from '../../components/edit-menu-modal'
import withBaseTable from '../../components/with-base-table'

const db = io.menu

class MerchantBannerManager extends React.Component {
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

  get merchantId() {
    const {match} = this.props
    return match.params.merchantId
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
    params.merchant_id = {$eq: this.merchantId}
    if (searchName) {
      params.name = {$contains: searchName}
    }
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

  handleEditRow = data => {
    this.setState({
      formData: data
    })
    this.handleShowAddModal()
  }

  handleChange(key, data) {
    const {meta} = this.state
    data[key] = !data[key]
    db.update(data.id, data).then(() => {
      message.success('更新成功')
      this.getDataSource({offset: meta.offset, limit: meta.limit})
    })
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

  handleSaveProgramData = data => {
    const {formData} = this.state
    if (!formData.id) {
      data.merchant_id = this.merchantId
    }
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
    const columnsWidth = [60, 120, 150, 90, 90, 90, 100, 180]
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
        title: '菜品名称',
        dataIndex: 'name',
      },
      {
        title: '原价',
        dataIndex: 'original_price',
      },
      {
        title: '现价',
        dataIndex: 'current_price',
      },
      {
        title: '折扣',
        dataIndex: 'discount',
      },
      {
        title: '是否推荐',
        dataIndex: 'is_recommend',
        render: (val, row) => {
          return <Switch checked={val} onChange={() => {this.handleChange('is_recommend', row)}}></Switch>
        },
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
          <span>菜品名称：</span>
          <Input
            style={{width: 220, marginRight: 15, marginBottom: 15, marginLeft: 10}}
            placeholder="请输入菜品名称"
            value={this.state.searchName}
            onChange={this.handleInput}
          />
          <Button type='primary' onClick={this.handleSearch}>
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
        {!visible ? null
          : <EditMenuModal
          visible={visible}
          onCancel={this.handleHideModal}
          formData={formData || {}}
          onSubmit={this.handleSaveProgramData}
        />}
      </>
    )
  }
}

const BaseTable = withBaseTable()

export default withRouter(Form.create()(MerchantBannerManager))
