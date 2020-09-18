import React from 'react'
import {NavLink, generatePath} from 'react-router-dom'
import utils from '../utils'
import {DATE_FORMAT} from '../config/constants'
import routePath from '../config/route-path'
import baseIO from '../io'
import {Table, Button} from 'antd'
import {_} from 'i18n-utils'
import RouteBreadcrumb from '../components/router-breadcrumb'

const LIMIT = 20

export default class TicketTypeListController extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      ticketTypeList: [],
      total: 0,
      currentRecord: {},
    }
  }

  componentDidMount() {
    this.getTicketTypeList({
      offset: 0,
      limit: LIMIT,
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
      onChange: (page, size) =>
        this.getTicketTypeList({
          offset: (page - 1) * size,
          limit: size,
        }),
    }
  }

  getTicketTypeList(params) {
    baseIO
      .getTicketTypeList(params)
      .then(res => {
        const data = res.data.objects
        this.setState({
          ticketTypeList: data,
          total: res.data.meta.total_count,
        })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  render() {
    const {ticketTypeList} = this.state
    const columns = [
      {
        title: _('序号'),
        key: 'index',
        width: 100,
        render: (val, row, index) => index + 1,
      },
      {
        title: _('票种名称'),
        key: 'name',
        render: (val, row, index) => {
          return (
            <div>
              <div>{row.name}</div>
              <div>{row.english_name}</div>
            </div>
          )
        },
      },
      {
        title: _('票种描述'),
        key: 'description',
        render: (val, row, index) => {
          return (
            <div>
              <div>{row.description}</div>
              <div>{row.english_description}</div>
            </div>
          )
        },
      },
      {
        title: _('创建时间'),
        dataIndex: 'created_at',
        render: (val, row, index) => {
          return utils.timeWithTimeZone(val * 1000).format(DATE_FORMAT)
        },
      },
      {
        title: _('操作'),
        key: 'action',
        render: (text, record) => {
          return (
            <Button ghost type='primary'>
              <NavLink to={generatePath(routePath.ticketTypeEdit, {id: record.id})}>{_('编辑')}</NavLink>
            </Button>
          )
        },
      },
    ]
    const breadcrumbList = [['', _('产品管理')], ['', _('票种列表')]]

    return (
      <React.Fragment>
        <div style={styl.breadcrumb}>
          <RouteBreadcrumb data={breadcrumbList} />
          <Button
            type='primary'
            onClick={() => {
              this.props.history.push({pathname: generatePath(routePath.ticketTypeEdit)})
            }}
          >
            {_('新增票种')}
          </Button>
        </div>
        <Table
          style={{backgroundColor: '#fff'}}
          pagination={this.pagination}
          rowKey={(row, index) => index}
          columns={columns}
          dataSource={ticketTypeList}
        />
      </React.Fragment>
    )
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px', display: 'flex', justifyContent: 'space-between'},
}
