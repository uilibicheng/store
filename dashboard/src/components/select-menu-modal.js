import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button , Modal} from 'antd'

import utils from '../utils'
import io from '../io'
import withBaseTable from '../components/with-base-table'
import '../assets/tailored.css'

const db = io.menu

class SelectMenuModal extends React.Component {
  state = {
    meta: {},
    dataSource: [],
    searchName: '',
    selectedMenuKey: [],
    selectedMenu: [],
  }

  hideModal = () => {
    const {onCancel} = this.props
    onCancel()
  }

  componentDidMount() {
    this.getDataSource()
  }

  getDataSource(params = {offset: 0, limit: 5}) {
    const {menuList} = this.props
    params.where = this.searchParams

    const selectedMenuKey = menuList.map(item => {
      return item.id
    })

    return db
      .find({
        ...params,
      })
      .then(res => {
        const {meta, objects} = res.data
        
        this.setState({
          meta,
          dataSource: objects,
          selectedMenuKey,
          selectedMenu: menuList
        })
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
    this.setState({
      searchName: value
    })
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    console.log('selectedRows', selectedRows)
    this.setState({
      selectedMenuKey: selectedRowKeys,
      selectedMenu: selectedRows,
    })
  }

  handleSubmit = e => {
    const {onSubmit} = this.props
    e.preventDefault()
    this.hideModal()
    onSubmit && onSubmit(this.state.selectedMenu)
  }

  render() {
    const {
      visible,
    } = this.props
    const{selectedMenuKey} = this.state
    const title = '选择菜品'

    const columnsWidth = [60, 130, 140, 90, 90]
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
    ].map((item, index) => {
      item.width = columnsWidth[index]
      return item
    })

    const columnsScrollWidth = columnsWidth.reduce((count, i) => count + i)
    const rowSelection = {
      selectedRowKeys: selectedMenuKey,
      onChange: this.onSelectChange,
    }
    
    return (
      <Modal
        className='tailored-modal'
        width='650px'
        visible={visible}
        title={title}
        okText='确定'
        cancelText='取消'
        onCancel={this.hideModal}
        onOk={this.handleSubmit}
      >
        <div>
          <span>菜品名称：</span>
          <Input
            style={{width: 220, marginRight: 15, marginBottom: 15, marginLeft: 10}}
            placeholder="请输入菜品名称"
            value={this.state.searchName}
            onChange={this.handleInput}
          />
          <Button type='primary' onClick={() => this.getDataSource()}>
            查询
          </Button>
        </div>
        <BaseTable
          {...this.props}
          columns={columns}
          scroll={{x: columnsScrollWidth}}
          dataSource={this.state.dataSource}
          rowSelection={rowSelection}
          pagination={utils.pagination(this.state.meta, params => this.getDataSource(params))}
        />
      </Modal>
    )
  }
}

const BaseTable = withBaseTable()
export default withRouter(Form.create()(SelectMenuModal))
