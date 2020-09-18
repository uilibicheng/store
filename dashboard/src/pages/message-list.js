import React from 'react'
import {NavLink, generatePath} from 'react-router-dom'
import utils from '../utils'
import routePath from '../config/route-path'
import {DATE_FORMAT} from '../config/constants'
import baseIO from '../io'
import {_} from 'i18n-utils'
import RouterBreadcrumb from '../components/router-breadcrumb'
import {Table, Button, message, Modal} from 'antd'

const LIMIT = 10

const TYPE_MAP = {
  immediate: '即时发送',
  timing: '定时发送',
}

const STATUS_MAP = {
  unsent: '未发送',
  sending: '发送中',
  sent: '已发送',
  fail: '发送失败',
}

export default class MessageListController extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      messageList: [],
      total: 0,
    }
  }

  componentDidMount() {
    this.getMessageList({
      offset: 0,
      limit: LIMIT,
    })
  }

  getMessageList(params) {
    baseIO
      .getMessageList(params)
      .then(res => {
        const data = res.data.objects
        this.setState({
          messageList: data,
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
      showTotal: total => {
        return _('共 {total} 条数据', {total})
      },
      showQuickJumper: true,
      onChange: (page, size) =>
        this.getMessageList({
          offset: (page - 1) * size,
          limit: size,
        }),
    }
  }

  updateStatus = (id, is_active) => {
    baseIO.updateMessage(id, {is_active: !is_active}).then(res => {
      if (res.status === 200) {
        this.getMessageList({
          offset: 0,
          limit: LIMIT,
        })
      }
    })
  }

  handleDeleteRecord = id => {
    Modal.confirm({
      title: _('确认删除') + '?',
      content: '',
      onOk: () => {
        baseIO
          .deleteMessageRecord(id)
          .then(res => {
            if (res.status === 204) {
              message.success(_('删除成功'))
              this.getMessageList({
                offset: 0,
                limit: LIMIT,
              })
            }
          })
          .catch(err => {
            throw new Error(err)
          })
      },
      onCancel() {},
    })
  }

  render() {
    const {messageList} = this.state
    const columns = [
      {
        title: _('序号'),
        key: 'index',
        width: 100,
        render: (val, row, index) => index + 1,
      },
      {
        title: _('消息标题'),
        key: 'title',
        width: 300,
        render: (val, row, index) => {
          return (
            <div>
              <div>{row.title}</div>
              <div>{row.english_title}</div>
            </div>
          )
        },
      },
      {
        title: _('发送类型'),
        dataIndex: 'type',
        width: 150,
        render: (val, row, index) => {
          return (
            <div>
              <p>{_(TYPE_MAP[val])}</p>
            </div>
          )
        },
      },
      {
        title: _('发送时间'),
        width: 300,
        dataIndex: 'sending_time',
        render: (val, row, index) => {
          return row.type === 'immediate' && val ? utils.timeWithTimeZone(val * 1000).format(DATE_FORMAT) : '-'
        },
      },
      {
        title: _('状态'),
        dataIndex: 'status',
        width: 150,
        render: val => {
          return _(STATUS_MAP[val])
        },
      },
      {
        title: _('操作'),
        key: 'action',
        width: 400,
        render: (text, record) => {
          return (
            <div>
              <Button ghost type='primary' style={{marginRight: 8, marginBottom: 8}}>
                <NavLink to={generatePath(routePath.messageEdit, {id: record.id})}>
                  {record.type === 'immediate' ? _('重新发送') : _('编辑')}
                </NavLink>
              </Button>
              {record.type === 'timing' && (
                <Button
                  ghost
                  type='primary'
                  style={{marginRight: 8, marginBottom: 8}}
                  onClick={() => this.updateStatus(record.id, record.is_active)}
                >
                  {record.is_active ? _('已激活') : _('未激活')}
                </Button>
              )}
              <Button ghost type='danger'>
                <a onClick={() => this.handleDeleteRecord(record.id)}>{_('删除')}</a>
              </Button>
            </div>
          )
        },
      },
    ]

    const breadcrumbList = [['', _('消息管理')], ['', _('活动消息发布')]]

    return (
      <React.Fragment>
        <div style={styl.breadcrumb}>
          <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 8}} />
          <Button
            type='primary'
            onClick={() => {
              this.props.history.push({pathname: generatePath(routePath.messageEdit)})
            }}
          >
            {_('新增消息')}
          </Button>
        </div>
        <Table
          style={{backgroundColor: '#fff'}}
          pagination={this.pagination}
          rowKey={(row, index) => index}
          columns={columns}
          dataSource={messageList}
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
