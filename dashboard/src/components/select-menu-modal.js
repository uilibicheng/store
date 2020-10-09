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
    const {menuList} = this.props
    let selectedMenuKey = menuList.map(item => {
      return item.id
    })
    this.setState({
      selectedMenuKey,
      selectedMenu: menuList,
    })
  }

  getDataSource(params = {offset: 0, limit: 5}) {
    // const {menuList} = this.props
    params.where = this.searchParams

    return db
      .find({
        ...params,
      })
      .then(res => {
        const {meta, objects} = res.data
        
        this.setState({
          meta,
          dataSource: objects,
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

  onSelect = (record, selected) => {
    let {selectedMenu, selectedMenuKey} = this.state
    if (selected) {
      selectedMenu.push(record)
      selectedMenuKey.push(record.id)
    } else {
      let index = selectedMenuKey.findIndex(item => item === record.id)
      selectedMenu.splice(index, 1)
      selectedMenuKey.splice(index, 1)
    }
    this.setState({
      selectedMenu,
      selectedMenuKey,
    })
  }

  onSelectAll = (selected, selectedRows, changeRows) => {
    let {selectedMenu, selectedMenuKey} = this.state
    if (selected) {
      selectedMenu = [...selectedMenu, ...selectedRows]
    } else {
      changeRows.forEach(row => {
        let index = selectedMenu.findIndex(item => item.id === row.id)
        selectedMenu.splice(index, 1)
      })
    }
    selectedMenu = this.initialData(selectedMenu)
    selectedMenuKey = selectedMenu.map(item => {
      return item.id
    })
    this.setState({
      selectedMenu,
      selectedMenuKey,
    })
  }

  onSelectChange = () => {
  }

  initialData(arr) {
    // 选中行去重
    let res = []
    let result = []
      for (let i = 0; i < arr.length; i++) {
        if (res.indexOf(arr[i].id) === -1) {
          res.push(arr[i].id)
          result.push(arr[i])
        }
      }
      return result
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

    const columnsWidth = [60, 130, 150, 80, 80]
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
      onSelect: this.onSelect,
      onChange: this.onSelectChange,
      onSelectAll: this.onSelectAll,
    }
    
    return (
      <Modal
        className='tailored-modal'
        width='700px'
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


