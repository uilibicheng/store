import React from 'react'
import {DATE_FORMAT, TABLE_ID, CLOUD_FUNCTION_NAME} from '../config/constants'
import utils from '../utils'
import baseIO from '../io'
import {Table, Button, Form, message, Spin, Row, Col, Input} from 'antd'
import RouteBreadcrumb from '../components/router-breadcrumb'
import {_} from 'i18n-utils'

const LIMIT = 20
const ButtonGroup = Button.Group
const columnsWidth = [100, 150, 150]

let timer = null

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
      activeBtn: 'all',
    }
  }

  componentDidMount() {
    this.getAccessControlList()
    this.getUserList({
      offset: 0,
      limit: LIMIT,
      order_by: '-updated_at',
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
        tableId: TABLE_ID.USER,
        includeKeys: ['nickname', 'updated_at'],
        timestampConvertKeys: ['updated_at'],
        customizeHeaders: {
          nickname: _('用户昵称'),
          updated_at: _('最近登录时间'),
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

  getUserList(params) {
    baseIO
      .getUserList(params)
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
        this.getUserList({
          where: {
            ...queryObj,
          },
          offset: (page - 1) * size,
          limit: size,
          order_by: '-updated_at',
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
        vals.nickname &&
          (queryObj.nickname = {
            $contains: vals.nickname,
          })

        this.getUserList({
          where: {
            ...queryObj,
            ...this.state.queryObj,
          },
          offset: 0,
          limit: LIMIT,
          order_by: '-updated_at',
        })
      }
    })
  }

  handleNameChange = e => {
    let {queryObj} = this.state
    if (!e.target.value) {
      delete queryObj.nickname
      this.setState({
        queryObj: {
          ...queryObj,
        },
      })
    } else {
      this.setState({
        queryObj: {
          ...queryObj,
          nickname: {
            $contains: e.target.value,
          },
        },
      })
    }
  }

  handleTimeQuery = e => {
    let {queryObj} = this.state
    const value = e.target.value
    const time = Math.floor(new Date().getTime() / 1000)
    if (value === 'all') {
      delete queryObj.updated_at
    }

    if (value === 'week') {
      queryObj = {
        ...queryObj,
        updated_at: {
          $lte: time,
          $gt: time - 7 * 24 * 60 * 60,
        },
      }
    } else if (value === 'month') {
      queryObj = {
        ...queryObj,
        updated_at: {
          $lte: time,
          $gt: time - 30 * 24 * 60 * 60,
        },
      }
    }

    this.setState({
      queryObj: {
        ...queryObj,
      },
      currentPage: 1,
      activeBtn: value,
    })

    setTimeout(() => {
      this.handleClickQuery()
    }, 100)
  }

  render() {
    const {userLogList, exporting, activeBtn} = this.state
    const {getFieldDecorator} = this.props.form
    const breadcrumbList = [['', _('权限管理')], ['', _('微信用户列表')]]

    const columns = [
      {
        title: _('序号'),
        key: 'index',
        render: (val, row, index) => index + 1,
      },
      {
        title: _('用户昵称'),
        dataIndex: 'nickname',
      },
      {
        title: _('最近登录时间'),
        dataIndex: 'updated_at',
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
          {getFieldDecorator('nickname')(
            <Input type='text' style={styl.select} placeholder={_('请输入用户昵称')} onChange={this.handleNameChange} />
          )}
          <Button type='primary' style={styl.btn} onClick={this.handleClickQuery}>
            {_('查询')}
          </Button>
        </Form>
        <Row align='middle' type='flex'>
          <Col style={{marginRight: 20, marginBottom: 20}}>
            <ButtonGroup>
              <Button
                value='all'
                type={activeBtn === 'all' ? 'primary' : 'default'}
                onClick={this.handleTimeQuery}
                style={{paddingLeft: 30, paddingRight: 30}}
              >
                {_('全部')}
              </Button>
              <Button
                value='week'
                type={activeBtn === 'week' ? 'primary' : 'default'}
                onClick={this.handleTimeQuery}
                style={{paddingLeft: 30, paddingRight: 30}}
              >
                {_('最近 7 天')}
              </Button>
              <Button
                value='month'
                type={activeBtn === 'month' ? 'primary' : 'default'}
                onClick={this.handleTimeQuery}
                style={{paddingLeft: 30, paddingRight: 30}}
              >
                {_('最近 30 天')}
              </Button>
            </ButtonGroup>
          </Col>
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
