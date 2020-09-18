import React from 'react'
import {Table, Row, Col, Card} from 'antd'
import {_} from 'i18n-utils'
import io from '../io'
import utils from '../utils'
import routePath from '../config/route-path'
import {DATE_FORMAT} from '../config/constants'
import {ORDER_STATUS, CURRENCY, PAYMENT_METHOD} from '../config/enums'
import RouteBreadcrumb from '../components/router-breadcrumb'

const utmSourceMap = {
  assistance: '默林游助力活动',
  lottery: '抽奖活动',
  share: '默林分享',
}
const columns = [
  {
    title: '门票名称',
    dataIndex: 'bundle_name',
  },
  {
    title: '票种',
    dataIndex: 'ticket_type_name',
  },
  {
    title: '二维码',
    dataIndex: 'barcode',
    render: val => (
      <React.Fragment>
        {val.map((i, index) => (
          <div key={index}>{i}</div>
        ))}
      </React.Fragment>
    ),
  },
  {
    title: '价格',
    dataIndex: 'price',
    render: (val, row, index) => {
      return CURRENCY[row.currency] + val
    },
  },
  {
    title: '订单总额',
    dataIndex: 'ticket_amount',
  },
  {
    title: '票务系统订单号',
    dataIndex: 'order_number',
    render: val => (
      <React.Fragment>
        {val.map((i, index) => (
          <div key={index}>{i}</div>
        ))}
      </React.Fragment>
    ),
  },
  {
    title: '票务系统状态',
    dataIndex: 'status',
    render: val => (
      <React.Fragment>
        {val.map((i, index) => (
          <div key={index}>{i}</div>
        ))}
      </React.Fragment>
    ),
  },
]

export default class OrderDetail extends React.PureComponent {
  state = {
    order: {},
    ticketInventoryList: [],
  }

  componentWillMount() {
    this.getData()
  }

  get id() {
    const {match} = this.props
    const id = match.params.id.trim()
    return id || null
  }

  get orderAt() {
    const {order} = this.state
    return order.created_at ? utils.timeWithFormated(order.created_at * 1000) : null
  }

  get useAt() {
    const {order} = this.state
    return order.reservation_date ? utils.timeWithFormated(order.reservation_date) : null
  }

  get productInfoList() {
    const {order, ticketInventoryList} = this.state
    if (!order.tickets_with_barcode) return []
    const skus = Array.from(new Set(order.tickets_with_barcode.map(i => i.sku)))
    const tickets = []
    const ticketTypeName = []
    const bundleName = []

    skus.forEach(sku => {
      const filteredTicketList = order.tickets_with_barcode.filter(i => i.sku === sku)
      if (!filteredTicketList.length) return
      tickets.push(filteredTicketList)
      const {ticket_type_name, ticket_type_english_name, bundle_name, bundle_english_name} = filteredTicketList[0]
      ticketTypeName.push(
        [ticket_type_name, ticket_type_english_name].filter(Boolean).map((v, i) => <div key={i}>{v}</div>)
      )
      bundleName.push([bundle_name, bundle_english_name].filter(Boolean).map((v, i) => <div key={i}>{v}</div>))
    })
    const priceCount = Array(skus.length).fill(0)
    const ticketCount = priceCount.slice()
    const barcodeCount = priceCount.slice().fill([])

    tickets.forEach((ticket, index) => {
      priceCount[index] = ticket.reduce((count, val) => count + val.price, 0)
      ticketCount[index] = ticket.length
      barcodeCount[index] = ticket.map(t => t.barcode)
    })

    return tickets.map((ticketList, index) => {
      const inventoryList = ticketList
        .map(i => i.barcode)
        .map(i => ticketInventoryList.find(j => j.barcode === i))
        .filter(Boolean)
      return {
        id: barcodeCount[index].join('-'),
        bundle_name: bundleName[index],
        ticket_type_name: ticketTypeName[index],
        barcode: barcodeCount[index],
        ticket_count: ticketCount[index],
        ticket_amount: priceCount[index],
        price: ticketList[0].is_discount ? ticketList[0].discount_price : ticketList[0].price,
        currency: ticketList[0].currency,
        status: inventoryList.map(i => i.status),
        order_number: inventoryList.map(i => i.order_number),
      }
    })
  }

  getTicketInventoryList() {
    const {order} = this.state
    if (!order.tickets_with_barcode) return Promise.resolve([])
    const barcodeList = order.tickets_with_barcode.map(i => i.barcode)
    return io
      .getTicketInventoryList({
        where: {
          barcode: {
            $in: barcodeList,
          },
        },
        limit: barcodeList.length,
      })
      .then(({data}) => {
        this.setState({ticketInventoryList: data.objects || []})
      })
  }

  getOrder = () => {
    if (!this.id) return
    return io.getOrder(this.id).then(({data}) => {
      this.setState({order: data})
      return data
    })
  }

  getData = () => {
    if (!this.id) return
    this.getOrder().then(data => {
      this.getTicketInventoryList()
    })
  }

  render() {
    const {order} = this.state
    const productInfoList = this.productInfoList
    columns.forEach(i => {
      i.title = _(i.title)
    })
    columns[4].render = (val, row, index) => {
      const obj = {
        children: CURRENCY[row.currency] + order.amount,
        props: {rowSpan: 0},
      }
      if (index === 0) {
        obj.props.rowSpan = productInfoList.length
      }
      return obj
    }
    const breadcrumbList = [
      [routePath.orderList, _('订单管理')],
      [routePath.orderList, _('产品订单')],
      ['', _('订单详情')],
    ]
    const orderInfo = (
      <Row>
        <Col span={6}>
          <label style={style.label}>{_('订单号')}：</label>
          {order.order_id}
        </Col>
        <Col span={4}>
          <label style={style.label}>{_('订单状态')}： </label>
          {ORDER_STATUS[order.status] && _(ORDER_STATUS[order.status])}
        </Col>
        <Col span={7}>
          <label style={style.label}>{_('下单时间')}：</label>
          {this.orderAt}
        </Col>
        <Col span={7}>
          <label style={style.label}>{_('使用时间')}：</label>
          {this.useAt}
        </Col>
      </Row>
    )

    return (
      <div>
        <RouteBreadcrumb data={breadcrumbList} style={{marginBottom: 20}} />
        <header style={style.header}>{_('订单详情')}</header>
        <Card title={orderInfo}>
          <Card type='inner' title={_('联系人信息')} style={style.card}>
            <div style={style.item}>
              <span style={style.name}>{order.pickup_person}</span>
              <span>{order.phone}</span>
            </div>
          </Card>
          <Card type='inner' title={_('支付方式')} style={style.card}>
            <div style={style.item}>{PAYMENT_METHOD[order.payment_method]}</div>
          </Card>
          <Card type='inner' title={_('支付流水号')} style={style.card}>
            <div style={style.item}>{order.trade_no || '-'}</div>
          </Card>
          <Card type='inner' title={_('退款流水号')} style={style.card}>
            <div style={style.item}>{order.refund_no || '-'}</div>
          </Card>
          <Card type='inner' title={_('退款备注')} style={style.card}>
            <div style={style.item}>{order.refund_memo || '-'}</div>
          </Card>
          <Card type='inner' title={_('退款时间')} style={style.card}>
            <div style={style.item}>
              {(order.refunded_at && utils.timeWithTimeZone(order.refunded_at * 1000).format(DATE_FORMAT)) || '-'}
            </div>
          </Card>
          <Card type='inner' title={_('购票方式')} style={style.card}>
            <div style={style.item}>{(order.utm_source && _(utmSourceMap[order.utm_source])) || '-'}</div>
          </Card>
          <Card type='inner' title={_('关联券')} style={style.card}>
            <div style={style.item}>{order.utm_medium || '-'}</div>
          </Card>
          <Card type='inner' title={_('产品信息')} style={style.card}>
            <Table style={style.table} columns={columns} dataSource={productInfoList} rowKey='id' pagination={false} />
          </Card>
        </Card>
      </div>
    )
  }
}

const style = {
  header: {
    fontSize: 24,
    fontWeight: 500,
    marginBottom: 12,
  },
  card: {
    marginBottom: 15,
  },
}
