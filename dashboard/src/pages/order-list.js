import React from 'react'
import {NavLink, generatePath} from 'react-router-dom'
import {Table, Row, Col, Button, Modal, Input, Select, Spin, message, Card, DatePicker} from 'antd'
import {_} from 'i18n-utils'
import io from '../io'
import utils from '../utils'
import routePath from '../config/route-path'
import {TABLE_ID, CLOUD_FUNCTION_NAME} from '../config/constants'
import {ORDER_STATUS, CURRENCY, PAYMENT_METHOD} from '../config/enums'
import RouteBreadcrumb from '../components/router-breadcrumb'

const LIMIT = 20

let timer = null

const utmSourceMap = {
  assistance: '默林游助力活动',
  lottery: '抽奖活动',
  share: '默林分享',
}
const Search = Input.Search
const Option = Select.Option
const TextArea = Input.TextArea
const RangePicker = DatePicker.RangePicker
const CardList = list =>
  list &&
  list.map((i, index) => (
    <React.Fragment key={index}>
      <Card style={{display: 'inline-block', marginBottom: 4}} bodyStyle={{padding: 4}}>
        {i}
      </Card>
      {index !== list.length - 1 && <br />}
    </React.Fragment>
  ))
const columnsWidth = [90, 120, 120, 140, 160, 240, 120, 90, 200, 120, 150, 150, 150, 150, 180, 120, 120, 150, 120, 150, 180]
const columns = [
  {
    title: '序号',
    key: 'index',
    render: (val, row, index) => index + 1,
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    render: val => _(ORDER_STATUS[val]),
  },
  {
    title: '联系人',
    dataIndex: 'pickup_person',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
  },
  {
    title: '订单号',
    dataIndex: 'order_id',
  },
  {
    title: 'Accesso Product ID',
    dataIndex: 'accesso_product_ids',
    render: val => CardList(val),
  },
  {
    title: '门票名称',
    dataIndex: 'bundle_name',
    render: val => CardList(val),
  },
  {
    title: '购票方式',
    dataIndex: 'utm_source',
    render: val => val ? _(utmSourceMap[val]) : '-',
  },
  {
    title: '关联券',
    dataIndex: 'utm_medium',
    render: val => val || '-',
  },
  {
    title: '票种',
    dataIndex: 'ticket_type_name',
    render: val => CardList(val),
  },
  {
    title: '数量',
    dataIndex: 'ticket_count',
    render: val => CardList(val),
  },
  {
    title: '票务系统订单号',
    dataIndex: 'order_numbers',
    render: val => CardList(val),
  },
  {
    title: '二维码',
    dataIndex: 'barcode',
    render: val => CardList(val),
  },
  {
    title: '订单总额',
    dataIndex: 'amount',
    render: (val, row) => CURRENCY[row.currency] + val,
  },
  {
    title: '支付方式',
    dataIndex: 'payment_method',
    render: val => PAYMENT_METHOD[val],
  },
  // {
  //   title: 'QFPay order number',
  //   dataIndex: 'QFPay_order_no',
  //   render: val => val || '-',
  // },
  {
    title: '支付流水号',
    dataIndex: 'trade_no',
    render: val => val || '-',
  },
  {
    title: '退款流水号',
    dataIndex: 'refund_no',
    render: val => val || '-',
  },
  {
    title: '下单时间',
    dataIndex: 'created_at',
    render: val => (val ? utils.timeWithJPYFormated(val * 1000) : '-'),
  },
  {
    title: '支付时间',
    dataIndex: 'paid_at',
    render: val => (val ? utils.timeWithJPYFormated(val * 1000) : '-'),
  },
  {
    title: '使用时间',
    dataIndex: 'reservation_date',
    render: val => (val ? utils.timeWithJPYFormated(val) : '-'),
  },
  {
    title: '操作者',
    dataIndex: 'refund_operator',
    render: val => (val ? val.nickname : '-'),
  },
  {
    title: '退款备注',
    dataIndex: 'refund_memo',
    render: val => val || '-',
  },
  {
    title: '退款时间',
    dataIndex: 'refunded_at',
    render: val => (val ? utils.timeWithJPYFormated(val * 1000) : '-'),
  },
  {
    fixed: 'right',
    title: '操作',
    key: 'operation',
  },
].map((i, index) => {
  i.width = columnsWidth[index]
  return i
})

class Operator extends React.PureComponent {
  state = {
    refunding: false,
    modalVisible: false,
    refund_memo: '',
  }

  showModal = () => this.setState({modalVisible: true})
  handleOk = () => {
    this.setState({modalVisible: false, refunding: true})
    this.refund().finally(() => this.setState({refunding: false}))
  }
  handleCancel = () => {
    this.setState({modalVisible: false})
  }
  handleMemoChange = e => this.setState({refund_memo: e.target.value})

  refund = () => {
    const {data: pdata, afterRefund, index} = this.props
    const {refund_memo} = this.state
    const refund_operator = {}
    return io
      .getUserInfo()
      .then(({data}) => Object.assign(refund_operator, data))
      .then(() =>
        io.refundOrder({
          trade_no: pdata.trade_no,
          refund_amount: pdata.amount,
        })
      )
      .then(response => {
        const {data} = response
        if (data.status !== 'succeed') {
          const err = new Error(`refund ${data.status}`)
          err.response = response
          throw err
        }
        return io.updateOrder(pdata.id, {
          status: 'refunded',
          refund_operator,
          refund_memo,
          refunded_at: data.refunded_at,
          refund_no: data.refund_no,
        })
      })
      .then(({data}) => {
        afterRefund(data, index)
      })
      .catch(e => {
        try {
          const error_msg = e.response.data.error_msg.toString()
          message.error(_(error_msg))
        } catch (err) {
          message.error(e.toString())
        }
      })
  }

  get refundBtnVisible() {
    const {data} = this.props
    return data.status === 'paid'
  }

  render() {
    const {data} = this.props
    const {modalVisible, refund_memo, refunding} = this.state
    return (
      <React.Fragment>
        <Modal
          title={_('确定退款')}
          visible={modalVisible}
          okText={_('退款')}
          cancelText={_('取消')}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <TextArea
            placeholder={_('退款备注信息')}
            value={refund_memo}
            onChange={this.handleMemoChange}
            autosize={{minRows: 4}}
          />
        </Modal>
        <NavLink to={generatePath(routePath.orderDetail, {id: data.id})}>
          <Button type='primary' ghost style={{marginRight: 8, marginBottom: 8}}>
            {_('查看')}
          </Button>
        </NavLink>
        {this.refundBtnVisible && (
          <Button type='danger' ghost disabled={refunding} onClick={this.showModal}>
            {_('退款')}
          </Button>
        )}
      </React.Fragment>
    )
  }
}

const dateRangeStatusMap = {
  refunded: 'refunded_at',
  cancelled: 'cancelled_at',
  paid: 'paid_at',
  closed: 'closed_at',
}
export default class OrderList extends React.PureComponent {
  state = {
    orderList: [],
    total: 0,
    editorType: 'coupon',
    exporting: false,
  }

  componentDidMount() {
    this.getData({limit: LIMIT})
  }

  get pagination() {
    const {total, currentPage} = this.state
    return {
      size: 'small',
      total,
      pageSize: LIMIT,
      current: currentPage,
      showTotal: num => _('共 {num} 条数据', {num}),
      onChange: (page, size) => {
        this.getData({
          where: this.searchParams,
          offset: (page - 1) * size,
          limit: size,
        })

        this.setState({
          currentPage: page,
        })
      },
    }
  }

  get searchParams() {
    const params = {}
    if (this.searchWord) {
      params.$or = [
        {order_id: {$eq: this.searchWord}},
        {phone: {$eq: this.searchWord}},
        {tickets_barcode_list: {$in: [this.searchWord]}},
      ]
    }
    if (this.searchStatus) params.status = {$eq: this.searchStatus}
    if (Array.isArray(this.searchDateRange) && this.searchDateRange.length) {
      const rangeObj = {}
      this.searchDateRange[0] && (rangeObj['$gte'] = utils.valueWithTimeZone(this.searchDateRange[0]) / 1000)
      this.searchDateRange[1] && (rangeObj['$lte'] = utils.valueWithTimeZone(this.searchDateRange[1]) / 1000)

      if (dateRangeStatusMap[this.searchStatus]) {
        params[dateRangeStatusMap[this.searchStatus]] = rangeObj
      } else {
        params.created_at = rangeObj
      }
    }

    if (this.searchDate) {
      let rangeObj = {}
      const selectTime = utils.valueWithTimeZone(this.searchDate) / 1000
      const gtTime = selectTime
      const ltTime = selectTime + 24 * 60 * 60
      rangeObj = {
        $gte: gtTime,
        $lt: ltTime,
      }

      if (dateRangeStatusMap[this.searchStatus]) {
        params[dateRangeStatusMap[this.searchStatus]] = rangeObj
      } else {
        params.created_at = rangeObj
      }
    }
    return params
  }

  get formatedListData() {
    const {orderList} = this.state
    if (!orderList.length) return []

    return orderList.map(order => {
      const skus = Array.from(new Set(order.tickets.map(i => i.sku)))
      const ticketBarcode = (order.tickets_with_barcode && order.tickets_with_barcode.map(i => i.barcode)) || []
      const tickets = []
      const ticketTypeName = []
      const bundleName = []

      skus.forEach(sku => {
        const filteredTicketList = order.tickets.filter(i => i.sku === sku)
        if (!filteredTicketList.length) return
        tickets.push(filteredTicketList)
        const {ticket_type_name, ticket_type_english_name, bundle_name, bundle_english_name} = filteredTicketList[0]

        ticketTypeName.push(
          [ticket_type_name, ticket_type_english_name].filter(Boolean).map(i => <div key={i}>{i}</div>)
        )
        bundleName.push([bundle_name, bundle_english_name].filter(Boolean).map(i => <div key={i}>{i}</div>))
      })
      const ticketCount = Array(skus.length).fill(0)

      tickets.forEach((ticket, index) => {
        ticketCount[index] = ticket.length
      })
      return {
        ...order,
        bundle_name: bundleName,
        ticket_type_name: ticketTypeName,
        ticket_count: ticketCount,
        barcode: ticketBarcode,
      }
    })
  }

  getData = (params = {}) => {
    return this.getOrderList(params)
  }

  getOrderList = (params = {}) => {
    return io.getOrderList(params).then(({data}) => {
      return new Promise(resolve =>
        this.setState(
          {
            orderList: data.objects || [],
            total: data.meta.total_count,
          },
          () => resolve()
        )
      )
    })
  }

  handleStatusChange = status => {
    this.searchStatus = status
    this.setState({
      currentPage: 1,
    })
    this.getData({where: this.searchParams})
  }

  handleKeyWordChange = e => {
    if (!e.currentTarget.value) {
      this.searchWord = e.currentTarget.value
      this.getData({where: this.searchParams})
    }
  }

  handleDateChange = (time, date) => {
    this.searchDate = date
    this.getData({where: this.searchParams})
  }

  handleDateRangeChange = (time, dates) => {
    if (time.length) {
      this.searchDateRange = dates
      if (!dates.length) {
        this.getData({where: this.searchParams})
      }
    } else {
      this.searchDateRange = []
    }
  }

  handleDateOk = () => {
    this.setState({
      currentPage: 1,
    })
    this.getData({where: this.searchParams})
  }

  afterRefund = (data, index) => {
    const orderList = [...this.state.orderList]
    orderList.splice(index, 1, data)
    this.setState({orderList})
  }

  search = word => {
    if (!word) return

    this.setState({
      currentPage: 1,
    })
    this.searchWord = word
    this.getData({where: this.searchParams})
  }

  exportListData = () => {
    message.info(_('数据正在导出，请耐心等待'))
    this.setState({
      exporting: true,
    })
    io.invokeCloudFunction(CLOUD_FUNCTION_NAME.CREATE_EXPORT_JOB_ID, {
      where: {
        ...this.searchParams,
      },
      expand: 'tickets_with_barcode',
      tableId: TABLE_ID.ORDER,
      timestampConvertKeys: ['created_at', 'paid_at', 'refunded_at', 'reservation_date'],
      scientificNotationConvertKeys: ['barcode'],
      splitRowKeys: ['bundle_english_name', 'ticket_type_english_name', 'barcode', 'price', 'discount_price', 'order_number', 'accesso_product_id'],
      splitRow: 'tickets_with_barcode',
      includeKeys: [
        'order_id',
        'status',
        'payment_method',
        'pickup_person',
        'phone',
        'bundle_english_name',
        'ticket_type_english_name',
        'order_number',
        'barcode',
        'utm_source',
        'utm_medium',
        'quantity',
        'price',
        'discount_price',
        'trade_no',
        'refund_no',
        'created_at',
        'paid_at',
        'refund_operator',
        'refund_memo',
        'refunded_at',
        'reservation_date',
        'accesso_product_id',
      ],
      customizeHeaders: {
        status: _('订单状态'),
        pickup_person: _('联系人'),
        phone: _('手机号'),
        order_id: _('订单号'),
        tickets: _('产品'),
        bundle_english_name: _('门票名称'),
        ticket_type_english_name: _('票种'),
        order_number: _('票务系统订单号'),
        barcode: _('二维码'),
        utm_source: _('购票方式'),
        utm_medium: _('关联券'),
        quantity: _('数量'),
        price: _('价格'),
        discount_price: _('折扣价'),
        payment_method: _('支付方式'),
        paid_at: _('支付时间'),
        created_at: _('下单时间'),
        // QFPay_order_no: 'QFPay order number',
        trade_no: _('支付流水号'),
        refund_no: _('退款流水号'),
        refunded_at: _('退款时间'),
        refund_memo: _('退款备注'),
        refund_operator: _('操作者'),
        reservation_date: _('使用时间'),
        accesso_product_id: 'Accesso Product ID',
      },
    })
      .then(res => {
        if (res.data.data.message === 'success') {
          this.checkExportJobResult(res.data.data.jobId)
        } else {
          message.error(_('数据导出失败'))
          this.setState({
            exporting: false,
          })
        }
      })
      .catch(() => {
        message.error(_('数据导出失败'))
        this.setState({
          exporting: false,
        })
      })
  }

  checkExportJobResult(jobId) {
    timer = setTimeout(() => {
      io.getExportTaskRecord(jobId)
        .then(res => {
          if (res.data.file_download_link) {
            const elink = document.createElement('a')
            elink.download = 'data.csv'
            elink.style.display = 'none'
            elink.href = res.data.file_download_link
            document.body.appendChild(elink)
            elink.click()
            document.body.removeChild(elink)
            message.success(_('数据导出成功'))
            this.setState({
              exporting: false,
              fileDownLoadUrl: res.data.file_download_link,
            })
            clearInterval(timer)
          } else {
            this.checkExportJobResult(jobId)
          }
        })
        .catch(() => {
          clearInterval(timer)
          this.setState({
            exporting: false,
          })
        })
    }, 1000)
  }

  componentWillUnmount() {
    clearTimeout(timer)
  }

  render() {
    const {exporting} = this.state
    let columnsScrollWidth = columnsWidth.reduce((count, i) => count + i)
    columns[columns.length - 1].render = (data, row, index) => (
      <Operator data={data} index={index} afterRefund={this.afterRefund} />
    )
    columns.forEach(i => {
      i.title = _(i.title)
    })
    const breadcrumbList = [[routePath.orderList, _('订单管理')], ['', _('产品订单')]]
    return (
      <div>
        <RouteBreadcrumb data={breadcrumbList} style={{marginBottom: 20}} />
        <Row align='middle' type='flex' gutter={16} style={{paddingBottom: 12}}>
          <Col span={4}>
            <Select placeholder={_('选择状态')} style={{width: '100%'}} onChange={this.handleStatusChange}>
              <Option value=''>{_('全部')}</Option>
              {Object.keys(ORDER_STATUS).map(i => (
                <Option key={i} value={i}>
                  {_(ORDER_STATUS[i])}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Search
              placeholder={`${_('订单号')} / ${_('手机号')} / ${_('二维码')}`}
              enterButton={_('查询')}
              onSearch={this.search}
              onChange={this.handleKeyWordChange}
            />
          </Col>
        </Row>
        <div style={styl.exportTip}>{'Note: ' + _('优先按天筛选')}</div>
        <Row>
          <Col span={8}>
            {_('下单时间') + ' (Day)'}：<DatePicker onChange={this.handleDateChange} format='YYYY-MM-DD' />
          </Col>
          <Col span={14}>
            {_('下单时间') + ' (Time range)'}：
            <RangePicker
              onOk={this.handleDateOk}
              onChange={this.handleDateRangeChange}
              showTime={{format: 'HH:mm'}}
              format='YYYY-MM-DD HH:mm'
            />
          </Col>
        </Row>
        <Row>
          <Col span={4}>
            <Spin spinning={exporting}>
              <Button
                style={{marginTop: 10, marginBottom: 10}}
                type='primary'
                block
                disabled={exporting}
                onClick={this.exportListData}
              >
                {_('导出列表')}
              </Button>
            </Spin>
          </Col>
        </Row>
        <div style={styl.exportTip}>{_('注意：导出列表操作频率最多为一分钟一次，否则会导出失败')}</div>
        <Table
          style={{backgroundColor: '#fff'}}
          scroll={{x: columnsScrollWidth}}
          pagination={this.pagination}
          rowKey='id'
          dataSource={this.formatedListData}
          columns={columns}
        />
      </div>
    )
  }
}

const styl = {
  exportTip: {
    color: '#999',
    fontSize: 14,
    marginBottom: 10,
  },
}
