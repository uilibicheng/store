import React from 'react'
import {DATE_FORMAT, TABLE_ID, CLOUD_FUNCTION_NAME} from '../config/constants'
import utils from '../utils'
import baseIO from '../io'
import {Table, Select, Button, Form, message, Spin, Row, Col} from 'antd'
import RouteBreadcrumb from '../components/router-breadcrumb'
import {_} from 'i18n-utils'

const LIMIT = 20
const Option = Select.Option
const columnsWidth = [100, 150, 150, 150, 120, 100]

let timer = null

const PAGE_MAP = [
  '乐高商店信息管理',
  '门票管理',
  '票种列表',
  '产品列表',
  '奖品列表',
  '二维码列表',
  '产品订单',
  '兑换记录',
  '库存预警',
  'banner 设置',
  '活动消息发布',
  '过期提醒',
  '闭园日期',
  '园区人流通知',
  '用户列表',
  '操作记录',
  '微信用户列表',
]

class UserLogManage extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      userLogList: [],
      accessControlList: [],
      ticketTypeList: [],
      total: 0,
      name: '',
      type: '',
      status: '',
      startDate: '',
      endDate: '',
      queryObj: {},
      fileDownLoadUrl: '',
      exporting: false,
    }
  }

  componentDidMount() {
    this.getAccessControlList()
    this.getUserLogList({
      offset: 0,
      limit: LIMIT,
    })
  }

  exportListData = () => {
    const {queryObj} = this.state
    message.info(_('数据正在导出，请耐心等待'))
    this.setState({
      exporting: true,
    })
    baseIO
      .invokeCloudFunction(CLOUD_FUNCTION_NAME.CREATE_EXPORT_JOB_ID, {
        where: {
          ...queryObj,
        },
        tableId: TABLE_ID.USER_LOG,
        timestampConvertKeys: ['created_at'],
        includeKeys: ['email', 'name', 'page', 'type', 'created_at'],
        customizeHeaders: {
          email: _('邮箱'),
          name: _('用户名称'),
          page: _('操作页面'),
          type: _('操作'),
          created_at: _('操作时间'),
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
      baseIO
        .getExportTaskRecord(jobId)
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

  getAccessControlList() {
    baseIO
      .getAccessControlList({limit: 1000})
      .then(res => {
        this.setState({
          accessControlList: res.data.objects,
        })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  getUserLogList(params) {
    baseIO
      .getUserLogList(params)
      .then(res => {
        const data = res.data.objects
        this.setState({
          userLogList: data || [],
          total: res.data.meta.total_count,
        })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  get pagination() {
    const {total, queryObj, currentPage} = this.state
    return {
      total,
      size: 'small',
      pageSize: LIMIT,
      showTotal: num => {
        return _('共 {num} 条数据', {num})
      },
      current: currentPage,
      showQuickJumper: true,
      onChange: (page, size) => {
        this.getUserLogList({
          where: {
            ...queryObj,
          },
          offset: (page - 1) * size,
          limit: size,
        })
        this.setState({
          currentPage: page,
          selectedRowKeys: [],
        })
      },
    }
  }

  handleClickQuery = () => {
    this.props.form.validateFields((err, vals) => {
      if (!err) {
        let queryObj = {}
        if (vals.name === 'all') {
          delete queryObj.email
        } else if (vals.name) {
          queryObj.email = vals.name
        }

        if (vals.type === 'all') {
          delete queryObj.page
        } else if (vals.type) {
          queryObj.page = this.state.queryObj.page
        }

        this.getUserLogList({
          where: {
            ...queryObj,
          },
          offset: 0,
          limit: LIMIT,
        })
      }
    })
  }

  handleNameChange = e => {
    let {queryObj} = this.state
    if (e === 'all') {
      delete queryObj.email
    } else {
      this.setState({
        queryObj: {
          ...queryObj,
          email: e,
        },
      })
    }
  }

  handlePageChange = e => {
    const {queryObj} = this.state
    this.setState({
      queryObj: {
        ...queryObj,
        page: {
          $in: [e, _(e)],
        },
      },
    })
  }

  render() {
    const {userLogList, accessControlList, exporting} = this.state
    const {getFieldDecorator} = this.props.form
    const breadcrumbList = [['', _('权限管理')], ['', _('操作记录')]]

    const columns = [
      {
        title: _('序号'),
        key: 'index',
        render: (val, row, index) => index + 1,
      },
      {
        title: _('邮箱'),
        dataIndex: 'email',
      },
      {
        title: _('用户名称'),
        dataIndex: 'name',
      },
      {
        title: _('操作页面'),
        dataIndex: 'page',
        render: val => _(val),
      },
      {
        title: _('操作'),
        dataIndex: 'type',
        render: val => _(val),
      },
      {
        title: _('操作时间'),
        dataIndex: 'created_at',
        render: (val, row, index) => {
          return utils.timeWithTimeZone(val * 1000).format(DATE_FORMAT)
        },
      },
    ].map((i, index) => {
      i.width = columnsWidth[index]
      return i
    })

    return (
      <React.Fragment>
        <RouteBreadcrumb data={breadcrumbList} style={{marginBottom: 20}} />
        <Form>
          {getFieldDecorator('name')(
            <Select placeholder={_('选择用户')} style={styl.select} onChange={this.handleNameChange}>
              <Option value='all'>{_('全部')}</Option>
              {accessControlList.map(item => {
                return (
                  <Option key={item.id} value={item.email}>
                    {item.name}
                  </Option>
                )
              })}
            </Select>
          )}
          {getFieldDecorator('type')(
            <Select placeholder={_('选择页面')} style={styl.select} onChange={this.handlePageChange}>
              <Option value='all'>{_('全部')}</Option>
              {PAGE_MAP.map((item, index) => {
                return (
                  <Option value={item} key={index}>
                    {_(item)}
                  </Option>
                )
              })}
            </Select>
          )}
          <Button type='primary' style={styl.btn} onClick={this.handleClickQuery}>
            {_('查询')}
          </Button>
        </Form>
        <Row align='middle' type='flex'>
          <Col style={{marginRight: 20, marginBottom: 20}}>
            <Spin spinning={exporting}>
              <Button type='primary' disabled={exporting} onClick={this.exportListData}>
                {_('导出列表')}
              </Button>
            </Spin>
          </Col>
        </Row>
        <div style={styl.exportTip}>{_('注意：导出列表操作频率最多为一分钟一次，否则会导出失败')}</div>
        <Table
          pagination={this.pagination}
          rowKey={(row, index) => index}
          columns={columns}
          dataSource={userLogList}
          style={{background: '#fff'}}
          scroll={{x: columnsWidth.reduce((count, i) => count + i)}}
        />
      </React.Fragment>
    )
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px', display: 'flex', justifyContent: 'space-between'},
  select: {
    width: 300,
    marginRight: 10,
    marginBottom: 10,
  },
  btn: {
    marginBottom: 20,
    marginRight: 20,
  },
  exportTip: {
    color: '#999',
    fontSize: 14,
    marginBottom: 20,
  },
}

export default Form.create()(UserLogManage)
