import React from 'react'
import {Link, generatePath} from 'react-router-dom'
import {Button, Popconfirm, message, Input, Select} from 'antd'
import moment from 'moment'

import io from '../io'
import base, {fileDownloadClient} from '../io/base'
import download from '../utils/download'
import {ROUTE} from '../route'
import {CLOUD_FUNCTION} from '../config'
import {DATE_FORMAT, ORDER_STATUS, ORDER_STATUS_NAME, CLOTHES_TYPE_NAME, FILE_GROUP_ID} from '../config/constants'
import utils from '../utils'
import withBaseTable from '../components/with-base-table'

const db = io.order
const Search = Input.Search
const Option = Select.Option

export default class OrderList extends React.PureComponent {
  state = {
    meta: {},
    dataSource: [],
  }

  componentDidMount() {
    this.getDataSource()
  }

  getDataSource(params = {offset: 0, limit: 20}) {
    params.where = this.searchParams
    return db.find(params).then(res => {
      const meta = res.data.meta
      const dataSource = res.data.objects
      this.setState({meta, dataSource})
      return res
    })
  }

  get searchParams() {
    const params = {}
    if (this.searchWord) {
      params.$or = [{order_id: {$eq: this.searchWord}}, {contact_phone: {$eq: this.searchWord}}]
    }
    if (this.searchStatus) params.product_status = {$in: [this.searchStatus]}

    return params
  }

  handleDownload = () => {
    return base.getFileCategory(FILE_GROUP_ID.TEMPLATE).then(res => {
      const data = res.data.objects
      if (data.length) {
        return fileDownloadClient.get(data[0].path).then(res => {
          download(res.data, 'template.csv', res.data.type)
        })
      }
    })
  }

  handleStatusChange = status => {
    this.searchStatus = status
    this.getDataSource()
  }

  handleSearchWordChange = e => {
    if (!e.currentTarget.value) {
      this.searchWord = e.currentTarget.value
      this.getDataSource()
    }
  }

  search = word => {
    if (!word) return
    this.searchWord = word
    this.getDataSource()
  }

  readFile = () => {
    const reader = new FileReader()
    reader.readAsText(document.getElementById('import-order').files[0], 'UTF-8')
    reader.onload = e => {
      this.handleOk(utils.convertToTable(e.target.result))
    }
  }

  handleOk = rawData => {
    return io.invokeCloudFunc(CLOUD_FUNCTION.import_order, rawData).then(res => {
      if (res === 'success') {
        message.success('导入成功')
        utils.sendAdminOperationLog(this.props, '导入')
        this.getDataSource()
      }
    })
  }

  handleDeleta = id => {
    db.delete(id).then(() => {
      message.success('删除成功')
      utils.sendAdminOperationLog(this.props, '删除')
      this.getDataSource(this.state.meta)
    })
  }

  render() {
    const columnsWidth = [60, 160, 200, 160, 120, 110, 150, 200, 180]
    const columns = [
      {
        title: '序号',
        key: 'index',
        render: (val, row, index) => this.state.meta.offset + index + 1,
      },
      {
        title: '订单号',
        dataIndex: 'order_id',
      },
      {
        title: '订单状态',
        dataIndex: 'product_list',
        render: val =>
          val.map((item, index) => {
            return index < 3 ? (
              <div>
                {CLOTHES_TYPE_NAME[item.clothes_type]} {item.clothes_type_index}-{ORDER_STATUS_NAME[item.status]}
                {item.status === ORDER_STATUS.SEND_OUT || item.status === ORDER_STATUS.SEND_BACK
                  ? `第 ${item[`${item.status}_count`]} 次`
                  : ''}
              </div>
            ) : index === 3 ? (
              <div>...</div>
            ) : null
          }),
      },
      {
        title: '商家名称',
        dataIndex: 'store_name',
      },
      {
        title: '客户名称',
        dataIndex: 'contact_name',
      },
      {
        title: '头像',
        dataIndex: 'avatar',
        render: val => (val ? <img src={val} style={{width: 50, height: 50}} /> : ''),
      },
      {
        title: '客户联系方式',
        dataIndex: 'contact_phone',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        render: val => moment.unix(val).format(DATE_FORMAT),
      },
      {
        fixed: 'right',
        title: '操作',
        key: 'action',
        render: (val, row) => (
          <>
            <Button type='primary' ghost style={{margin: '0px 8px'}}>
              <Link to={generatePath(ROUTE.ORDER_EDIT, {id: row.id})}>编辑</Link>
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
      <BaseTable
        {...this.props}
        columns={columns}
        scroll={{x: columnsScrollWidth}}
        dataSource={this.state.dataSource}
        handleStatusChange={this.handleStatusChange}
        handleSearchWordChange={this.handleSearchWordChange}
        handleDownload={this.handleDownload}
        search={this.search}
        readFile={this.readFile}
        pagination={utils.pagination(this.state.meta, params => this.getDataSource(params))}
      />
    )
  }
}

const BaseTable = withBaseTable(
  props => <Left {...props} />,
  props => <Right {...props} />
)

function Left(props) {
  return (
    <>
      <Select placeholder='选择订单状态' style={{width: 150}} onChange={value => props.handleStatusChange(value)}>
        <Option value=''>全部订单</Option>
        {Object.keys(ORDER_STATUS_NAME).map((item, index) => {
          return (
            <Option value={item} key={index}>
              {ORDER_STATUS_NAME[item]}
            </Option>
          )
        })}
      </Select>
      <Search
        placeholder='订单号/联系方式'
        enterButton='查询'
        style={{width: 250, marginLeft: 20}}
        onSearch={world => props.search(world)}
        onChange={e => props.handleSearchWordChange(e)}
      />
    </>
  )
}

function Right(props) {
  return (
    <>
      <Button type='primary'>
        <a onClick={props.handleDownload}>模版下载</a>
      </Button>
      <Button type='primary' style={{position: 'relative', marginLeft: 20}}>
        <input type='file' id='import-order' style={style.inputFile} onChange={props.readFile} />
        导入订单
      </Button>
    </>
  )
}

const style = {
  inputFile: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0,
    width: '100%',
    height: 32,
    cursor: 'pointer',
    zIndex: 100,
  },
}
