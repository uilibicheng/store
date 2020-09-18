import React from 'react'
import {NavLink, generatePath} from 'react-router-dom'
import utils from '../utils'
import routePath from '../config/route-path'
import {DATE_FORMAT} from '../config/constants'
import baseIO from '../io'
import {Table, Button} from 'antd'
import {_} from 'i18n-utils'
import RouterBreadcrumb from '../components/router-breadcrumb'

const LIMIT = 10

export default class PrizeListController extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      prizeList: [],
      total: 0,
    }
  }

  componentDidMount() {
    this.getPrizeList({
      offset: 0,
      limit: LIMIT,
      order_by: '-type',
    })
  }

  getPrizeList(params) {
    baseIO
      .getPrizeList(params)
      .then(res => {
        const data = res.data.objects
        this.setState({
          prizeList: data,
          total: res.data.meta.total_count,
        })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  get pagination() {
    const {total} = this.state
    return {
      total,
      size: 'small',
      pageSize: LIMIT,
      showTotal: num => {
        return _('共 {num} 条数据', {num})
      },
      showQuickJumper: true,
      onChange: (page, size) =>
        this.getPrizeList({
          offset: (page - 1) * size,
          limit: size,
          order_by: '-type',
        }),
    }
  }

  render() {
    const {prizeList} = this.state
    const PRIZE_LIST = {
      promotional_bundle: _('新人优惠大礼'),
      normal: _('普通奖品'),
    }
    const columns = [
      {
        title: _('id'),
        dataIndex: 'id',
        width: 150,
      },
      {
        title: _('图片'),
        dataIndex: 'images',
        render: (val, row, index) => {
          return Array.isArray(row.images) && <img src={row.images[0]} alt='img' width={100} />
        },
      },
      {
        title: _('奖品名称'),
        dataIndex: 'name',
        width: 160,
      },
      {
        title: _('英文名称'),
        dataIndex: 'english_name',
        width: 160,
      },
      {
        title: _('奖品类型'),
        dataIndex: 'type',
        width: 140,
        render: (val, row, index) => {
          return PRIZE_LIST[val]
        },
      },
      {
        title: _('优先级'),
        dataIndex: 'priority',
        width: 100,
      },
      {
        title: _('创建时间'),
        dataIndex: 'created_at',
        width: 150,
        render: (val, row, index) => {
          return utils.timeWithTimeZone(val * 1000).format(DATE_FORMAT)
        },
      },

      {
        title: _('操作'),
        key: 'action',
        render: (text, record) => {
          return (
            <Button type='primary' ghost>
              <NavLink to={generatePath(routePath.prizeEdit, {id: record.id})}>{_('编辑')}</NavLink>
            </Button>
          )
        },
      },
    ]
    const breadcrumbList = [['', _('奖品管理')], ['', _('奖品列表')]]

    return (
      <React.Fragment>
        <div style={styl.breadcrumb}>
          <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 20}} />
          <Button
            type='primary'
            onClick={() => {
              this.props.history.push({pathname: generatePath(routePath.prizeEdit)})
            }}
          >
            {_('新增奖品')}
          </Button>
        </div>
        <Table
          style={{backgroundColor: '#fff'}}
          pagination={this.pagination}
          rowKey={(row, index) => index}
          columns={columns}
          dataSource={prizeList}
        />
      </React.Fragment>
    )
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px', display: 'flex', justifyContent: 'space-between'},
  warn: {color: '#fff', backgroundColor: 'red', paddingLeft: 6, paddingRight: 6, marginLeft: 10},
  aFile: {
    position: 'relative',
  },
  inputFile: {
    position: 'absolute',
    right: 0,
    top: 0,
    opacity: 0,
    cursor: 'pointer',
    width: 70,
  },
}
