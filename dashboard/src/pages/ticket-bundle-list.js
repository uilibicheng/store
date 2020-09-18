import React from 'react'
import {NavLink, generatePath} from 'react-router-dom'
import {Table, Row, Col, Button, Modal, Popconfirm, message} from 'antd'
import {_} from 'i18n-utils'
import io from '../io'
import utils from '../utils'
import {CLOUD_FUNCTION_NAME} from '../config/constants'
import routePath from '../config/route-path'

import RouteBreadcrumb from '../components/router-breadcrumb'

const LIMIT = 20
const successModal = Modal.success

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 280,
  },
  {
    title: _('门票名称'),
    key: 'name',
    width: 280,
    render: row => (
      <React.Fragment>
        {[row.name, row.english_name].map((v, i) => (
          <div key={i}>{v}</div>
        ))}
      </React.Fragment>
    ),
  },
  {
    title: _('优先级'),
    dataIndex: 'priority',
    width: 120,
  },
  {
    title: _('Accesso Product ID'),
    dataIndex: 'accesso_product_id',
    width: 200,
  },
  {
    title: _('创建时间'),
    dataIndex: 'created_at',
    width: 180,
    render: val => utils.timeWithFormated(val * 1000),
  },
  {
    title: _('操作'),
    key: 'operator',
  },
]

class Operator extends React.PureComponent {
  toggleActive = () => {
    const {data} = this.props
    const is_active = data.is_active
    io.updateTicketBundle(data.id, {is_active: !is_active}).then(() => {
      this.props.reloadList()
      if (is_active) {
        this.getProductList({
          where: {
            sku: {
              $contains: data.id,
            },
          },
        }).then(res => {
          res.forEach(v => {
            this.updateProductStatus(v.id)
          })
        })
      }
    })
  }

  updateProductStatus = id => {
    io.updateProductRecord(id, {is_active: false}).catch(err => {
      throw new Error(err)
    })
  }

  getProductList(params) {
    return io
      .getProductList(params)
      .then(res => {
        return res.data.objects
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  generateQrcode = () => {
    const id = this.props.data.id
    const reqObj = {
      type: 'wxacode',
      params: {
        path: `pages/ticket/ticket?id=${id}`,
        width: 360,
      },
    }
    io.invokeCloudFunction(CLOUD_FUNCTION_NAME.GET_WX_QRCODE, reqObj)
      .then(({data}) => {
        const result = data.data
        if (!result) {
          return message.error(data.error.message || data.error.type)
        }
        const imageURL = result.imageBase64 || ''
        this.successModalHolder = successModal({
          title: _('点击图片下载小程序码'),
          content: (
            <a href={imageURL} download>
              <img src={imageURL} alt='景区小程序二维码' style={{width: '100%', paddingRight: 38}} />
            </a>
          ),
        })
      })
      .catch(err => message.error(err.toString()))
  }

  render() {
    const {data} = this.props
    const action = data.is_active ? _('下架') : _('上架')
    return (
      <React.Fragment>
        <NavLink to={generatePath(routePath.ticketBundleEditor, {id: data.id})}>
          <Button type='primary' ghost style={{marginRight: '8px', marginBottom: '8px'}}>
            {_('编辑')}
          </Button>
        </NavLink>
        <Popconfirm title={_('确定执行此操作')} onConfirm={this.toggleActive} okText={_('确定')} cancelText={_('取消')}>
          <Button type='danger' ghost style={{marginRight: '8px', marginBottom: '8px'}}>
            {action}
          </Button>
        </Popconfirm>
        <Button type='primary' ghost onClick={this.generateQrcode} style={{marginRight: '8px', marginBottom: '8px'}}>
          {_('二维码')}
        </Button>
      </React.Fragment>
    )
  }
}

export default class TicketBundleList extends React.PureComponent {
  componentDidMount() {
    this.getTicketBundleList()
  }

  state = {
    ticketBundleList: [],
    total: 0,
    editorType: 'coupon',
  }

  get pagination() {
    const {total} = this.state
    return {
      total,
      size: 'small',
      pageSize: LIMIT,
      showTotal: num => _('共 {num} 条数据', {num}),
      onChange: (page, size) =>
        this.getTicketBundleList({
          where: this.searchObj,
          offset: (page - 1) * size,
          limit: size,
        }),
    }
  }

  get searchObj() {
    return this.searchWord
      ? {
        title: {
          $contains: this.searchWord,
        },
      }
      : {}
  }

  getTicketBundleList = (params = {}) => {
    io.getTicketBundleList({
      ...params,
      limit: LIMIT,
    }).then(({data}) => {
      this.setState({
        ticketBundleList: data.objects || [],
        total: data.meta.total_count,
      })
    })
  }

  render() {
    const breadcrumbList = [[routePath.ticketBundleList, _('产品管理')], ['', _('门票管理')]]
    const {ticketBundleList} = this.state
    columns[columns.length - 1].render = data => <Operator data={data} reloadList={this.getTicketBundleList} />
    columns.forEach(i => {
      i.title = _(i.title)
    })
    return (
      <React.Fragment>
        <Row align='middle' type='flex' style={{marginBottom: 20}}>
          <Col span={20}>
            <RouteBreadcrumb data={breadcrumbList} />
          </Col>
          <Col span={4} style={{textAlign: 'right'}}>
            <NavLink to={generatePath(routePath.ticketBundleEditor)}>
              <Button type='primary' data-type='coupon'>
                {_('新增门票')}
              </Button>
            </NavLink>
          </Col>
        </Row>
        <Table
          style={{backgroundColor: '#fff'}}
          pagination={this.pagination}
          rowKey='id'
          dataSource={ticketBundleList}
          columns={columns}
        />
      </React.Fragment>
    )
  }
}
