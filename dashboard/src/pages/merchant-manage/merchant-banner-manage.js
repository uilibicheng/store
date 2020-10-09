import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, message, Popconfirm} from 'antd'

import io from '../../io'
import utils from '../../utils'
import EditMerchantBannerModal from '../../components/edit-merchant-banner-modal'
import withBaseTable from '../../components/with-base-table'

const db = io.merchantBanner

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
    const columnsWidth = [60, 150, 150, 130, 100, 180]
    const columns = [
      {
        title: '序号',
        key: 'index',
        render: (val, row, index) => this.state.meta.offset + index + 1,
      },
      {
        title: '轮播图片',
        dataIndex: 'image',
        render: val => {
          return <img style={{width: 100, height: 50, objectFit: 'contain'}} src={val} />
        }
      },
      {
        title: '轮播图名称',
        dataIndex: 'name',
      },
      {
        title: '顺序',
        dataIndex: 'serial_number',
      },
      {
        title: '状态',
        dataIndex: 'is_display',
        render: val => val ? '显示' : '隐藏',
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
          <span>图片名称：</span>
          <Input
            style={{width: 220, marginRight: 15, marginBottom: 15, marginLeft: 10}}
            placeholder="请输入图片名称"
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
          : <EditMerchantBannerModal
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
