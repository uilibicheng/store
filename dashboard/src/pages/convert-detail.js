import React from 'react'
import {Card} from 'antd'
import io from '../io'
import {DATE_FORMAT} from '../config/constants'
import utils from '../utils'
import RouterBreadcrumb from '../components/router-breadcrumb'
import routePath from '../config/route-path'
import {_} from 'i18n-utils'

export default class ConvertDetail extends React.PureComponent {
  state = {
    detail: {},
  }

  componentWillMount() {
    this.getData()
  }

  get id() {
    const {match} = this.props
    const id = match.params.id.trim()
    return id || null
  }

  getData = () => {
    if (!this.id) return
    return io.getPrizeRedemptionDetail(this.id).then(({data}) => {
      this.setState({detail: data})
      return data
    })
  }

  render() {
    const {detail} = this.state
    const breadcrumbList = [['', _('订单管理')], [routePath.convertList, _('兑换记录')], ['', _('兑换记录详情')]]
    const statusMap = {
      pending: _('待核销'),
      redeemed: _('已核销'),
      closed: _('已关闭'),
    }

    return (
      <div>
        <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 8}} />
        <Card title={_('兑换记录详情')}>
          <Card type='inner' title={_('状态')} style={style.card}>
            <div style={style.item}>{statusMap[detail.status]}</div>
          </Card>
          <Card type='inner' title={_('兑换时间')} style={style.card}>
            <div style={style.item}>{utils.timeWithTimeZone(detail.created_at * 1000).format(DATE_FORMAT)}</div>
          </Card>
          <Card type='inner' title={_('核销时间')} style={style.card}>
            <div style={style.item}>
              {detail.redeemed_at ? utils.timeWithTimeZone(detail.redeemed_at * 1000).format(DATE_FORMAT) : '-'}
            </div>
          </Card>
          <Card type='inner' title={_('名称')} style={style.card}>
            <div style={style.item}>{detail.prize && detail.prize.name}</div>
            <div style={style.item}>{detail.prize && detail.prize.english_name}</div>
          </Card>
          <Card type='inner' title={_('兑换码')} style={style.card}>
            <div style={style.item}>{detail.redemption_code}</div>
          </Card>
          <Card type='inner' title={_('兑换份数')} style={style.card}>
            <div style={style.item}>{detail.redemption_quantity}</div>
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
  span: {
    fontSize: 14,
    color: '#333',
    marginLeft: 20,
  },
  card: {
    marginBottom: 15,
  },
}
