import React from 'react'
import {NavLink, generatePath} from 'react-router-dom'
import routePath from '../config/route-path'
import {DATE_FORMAT} from '../config/constants'
import utils from '../utils'
import baseIO from '../io'
import {_} from 'i18n-utils'
import {Table, Button, message, Modal} from 'antd'
import RouterBreadcrumb from '../components/router-breadcrumb'

const confirm = Modal.confirm

const LIMIT = 10

export default class AccessControlListController extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      accessControlList: [],
      total: 0,
    }
  }

  componentDidMount() {
    this.getAccessControlList({
      offset: 0,
      limit: LIMIT,
    })
  }

  getAccessControlList(params) {
    baseIO
      .getAccessControlList(params)
      .then(res => {
        this.setState({
          accessControlList: res.data.objects,
          total: res.data.meta.total_count,
        })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  handleDelete = id => {
    confirm({
      title: _('确认删除?'),
      content: '',
      cancelText: _('取消'),
      okText: _('确认'),
      onOk: () => {
        baseIO.deleteAccessControlRecord(id).then(res => {
          if (res.status === 204) {
            message.success(_('删除成功'))
            this.getAccessControlList({
              offset: 0,
              limit: LIMIT,
            })
          }
        })
      },
      onCancel() {},
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
        this.getAccessControlList({
          offset: (page - 1) * size,
          limit: size,
        }),
    }
  }

  render() {
    const {accessControlList} = this.state
    const columns = [
      {
        title: _('序号'),
        key: 'index',
        width: 100,
        render: (val, row, index) => index + 1,
      },
      {
        title: _('邮箱'),
        dataIndex: 'email',
        width: 300,
      },
      {
        title: _('用户名称'),
        dataIndex: 'name',
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
        render: (text, record, index) => {
          return (
            <div>
              <Button type='primary' ghost style={{marginBottom: 8, marginRight: 8}}>
                <NavLink to={generatePath(routePath.accessControlEdit, {id: record.id})}>{_('编辑')}</NavLink>
              </Button>
              <Button type='danger' ghost onClick={() => this.handleDelete(record.id)}>
                {_('删除')}
              </Button>
            </div>
          )
        },
      },
    ]

    const breadcrumbList = [['', _('权限管理')], ['', _('用户列表')]]

    return (
      <React.Fragment>
        <div style={styl.breadcrumb}>
          <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 8}} />
        </div>
        <div style={styl.tips}>
          <p>Tips：</p>
          <p>
            {_(
              '第一步：进入成员后台添加成员——第二步：返回该后台添加用户并设置权限，添加用户填写的邮箱必须是成员后台已存在的邮箱，否则用户无法享用对应的权限'
            )}
          </p>
        </div>
        <Button type='primary' style={styl.btn}>
          <a href='https://cloud.minapp.com/dashboard/#/enterprise/team/' rel='noopener noreferrer' target='_blank'>
            {_('进入成员后台')}
          </a>
        </Button>
        <Button
          type='primary'
          onClick={() => {
            this.props.history.push({pathname: generatePath(routePath.accessControlEdit)})
          }}
        >
          {_('添加用户')}
        </Button>
        <Table
          style={{backgroundColor: '#fff'}}
          pagination={this.pagination}
          rowKey={(row, index) => index}
          columns={columns}
          dataSource={accessControlList}
        />
      </React.Fragment>
    )
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px', display: 'flex', justifyContent: 'space-between'},
  tips: {
    color: '#555',
  },
  btn: {
    marginBottom: 20,
    marginRight: 20,
  },
}
