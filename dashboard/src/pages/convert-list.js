import React from 'react'
import ReactDOM from 'react-dom'
import {NavLink, generatePath} from 'react-router-dom'
import {DATE_FORMAT, TABLE_ID, SIGN_OUT_URL, CLOUD_FUNCTION_NAME} from '../config/constants'
import routePath from '../config/route-path'
import utils from '../utils'
import baseIO from '../io'
import {Table, Button, Form, Input, message, Modal, Select, DatePicker, Spin, Row, Col} from 'antd'
import RouterBreadcrumb from '../components/router-breadcrumb'
import {_} from 'i18n-utils'

const LIMIT = 10
const columnsWidth = utils.isPC() ? [150, 150, 150, 150, 180, 120, 150, 150, 150, 150, 150] : [130, 90, 100, 90]
const Option = Select.Option
const {RangePicker} = DatePicker

let timer = null

class ConvertList extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      prizeRedemptionList: [],
      total: 0,
      redemption_code: '',
      queryObj: {},
      userInfo: {},
      exporting: false,
      isDesktop: utils.isPC(),
    }
  }

  mobileNode = null

  componentWillMount() {
    !this.state.isDesktop && this.initMobileView()
  }

  componentDidMount() {
    if (!this.state.isDesktop) {
      document.querySelector('.ant-layout').style.display = 'none'
      document.querySelector('.ant-layout-sider').style.display = 'none'
    }
    this.getCurrentUserInfo()
    this.getPrizeRedemptionList({
      offset: 0,
      limit: LIMIT,
    })
  }

  initMobileView() {
    if (!this.mobileNode) {
      let node = document.createElement('div')
      node.classList.add('conver-mobile')
      document.body.appendChild(node)
      this.mobileNode = node
    }
  }

  componentWillUnmount() {
    clearTimeout(timer)
    if (!this.state.isDesktop) {
      document.querySelector('.ant-layout').style.display = 'block'
      document.querySelector('.ant-layout-sider').style.display = 'block'
      ReactDOM.unmountComponentAtNode(this.mobileNode)
      document.body.removeChild(this.mobileNode)
    }
  }

  getCurrentUserInfo() {
    baseIO.getUserInfo().then(res => {
      this.setState({
        userInfo: res.data,
      })
    })
  }

  getPrizeRedemptionList(params) {
    baseIO
      .getPrizeRedemptionList(params)
      .then(res => {
        const data = res.data.objects
        this.setState({
          prizeRedemptionList: data || [],
          total: res.data.meta.total_count,
        })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  handleChangeStatus = e => {
    const {queryObj, userInfo: operator} = this.state
    Modal.confirm({
      title: _('确定执行本次核销操作') + '?',
      content: '',
      onOk: () => {
        const data = {
          status: 'redeemed',
          operator,
          redeemed_at: (Date.now() / 1000) << 0,
        }
        baseIO.updatePrizeRedemption(e.id, data).then(res => {
          message.success(_('操作成功'))
          this.getPrizeRedemptionList({
            where: {
              ...queryObj,
            },
            offset: 0,
            limit: LIMIT,
          })
        })
      },
      onCancel() {},
    })
  }

  get pagination() {
    const {total, queryObj} = this.state
    return {
      total,
      size: 'small',
      pageSize: LIMIT,
      showTotal: num => {
        return _('共 {num} 条数据', {num})
      },
      showQuickJumper: true,
      onChange: (page, size) => {
        this.getPrizeRedemptionList({
          where: {
            ...queryObj,
          },
          offset: (page - 1) * size,
          limit: size,
        })
      },
    }
  }

  handleClickQuery = () => {
    this.props.form.validateFields((err, vals) => {
      if (!err) {
        let {queryObj, english_name} = this.state
        const redemption_code = document.querySelector('.redemption-code-input').value
        if (redemption_code) {
          queryObj.redemption_code = redemption_code
        } else {
          delete queryObj.redemption_code
        }

        if (Object.keys(this.created_at).length) {
          queryObj.created_at = this.created_at
        } else {
          delete queryObj.created_at
        }

        if (Object.keys(this.redeemed_at).length) {
          queryObj.redeemed_at = this.redeemed_at
        } else {
          delete queryObj.redeemed_at
        }

        if (english_name) {
          queryObj.english_name = {
            $contains: english_name,
          }
        } else {
          delete queryObj.english_name
        }

        this.setState({
          queryObj,
        })

        this.getPrizeRedemptionList({
          where: {
            ...queryObj,
          },
          offset: 0,
          limit: LIMIT,
        })
      }
    })
  }

  handleStatusChange = e => {
    let {queryObj} = this.state
    if (e === 'all') {
      delete queryObj.status
    } else {
      this.setState({
        queryObj: {
          ...queryObj,
          status: e,
        },
      })
    }
  }

  handleTypeChange = e => {
    let {queryObj} = this.state
    if (e === 'all') {
      delete queryObj.type
    } else {
      this.setState({
        queryObj: {
          ...queryObj,
          type: e,
        },
      })
    }
  }

  handleRedeemedDateChange = (time, date) => {
    this.redeemedDate = date
  }

  handleRedeemedDateRangeChange = (time, dates) => {
    this.redeemedDateRange = dates
  }

  get redeemed_at() {
    let params = {}
    if (Array.isArray(this.redeemedDateRange) && this.redeemedDateRange.length) {
      const rangeObj = {}
      this.redeemedDateRange[0] && (rangeObj['$gte'] = utils.valueWithTimeZone(this.redeemedDateRange[0]) / 1000)
      this.redeemedDateRange[1] && (rangeObj['$lte'] = utils.valueWithTimeZone(this.redeemedDateRange[1]) / 1000)

      params = rangeObj
    }

    if (this.redeemedDate) {
      let rangeObj = {}
      const selectTime = utils.valueWithTimeZone(this.redeemedDate) / 1000
      const gtTime = selectTime
      const ltTime = selectTime + 24 * 60 * 60
      rangeObj = {
        $gte: gtTime,
        $lt: ltTime,
      }

      params = rangeObj
    }

    return params
  }

  get created_at() {
    let params = {}
    if (Array.isArray(this.createDateRange) && this.createDateRange.length) {
      const rangeObj = {}
      this.createDateRange[0] && (rangeObj['$gte'] = utils.valueWithTimeZone(this.createDateRange[0]) / 1000)
      this.createDateRange[1] && (rangeObj['$lte'] = utils.valueWithTimeZone(this.createDateRange[1]) / 1000)

      params = rangeObj
    }

    if (this.createDate) {
      let rangeObj = {}
      const selectTime = utils.valueWithTimeZone(this.createDate) / 1000
      const gtTime = selectTime
      const ltTime = selectTime + 24 * 60 * 60
      rangeObj = {
        $gte: gtTime,
        $lt: ltTime,
      }

      params = rangeObj
    }

    return params
  }

  handleCreateDateChange = (time, date) => {
    this.createDate = date
  }

  handleCreateDateRangeChange = (time, dates) => {
    this.createDateRange = dates
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
        tableId: TABLE_ID.PRIZE_REDEMPTION_LOG,
        timestampConvertKeys: ['closed_at', 'redeemed_at', 'created_at'],
        scientificNotationConvertKeys: ['redemption_code'],
        includeKeys: [
          'status',
          'english_name',
          'type',
          'redemption_quantity',
          'redemption_code',
          'created_at',
          'redeemed_at',
          'closed_at',
          'operator',
        ],
        customizeHeaders: {
          status: _('状态'),
          english_name: _('英文名称'),
          type: _('奖品类型'),
          redemption_quantity: _('兑换份数'),
          redemption_code: _('兑换码'),
          created_at: _('兑换时间'),
          redeemed_at: _('核销时间'),
          closed_at: _('过期时间'),
          operator: _('操作人'),
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

  handleCodeInput = e => {
    this.setState({
      redemption_code: e.target.value,
    })
  }

  handleSignOut = () => {
    window.location.href = SIGN_OUT_URL
  }

  handleNameInput = e => {
    const {queryObj} = this.state

    this.setState({
      english_name: e.target.value,
      queryObj: {
        ...queryObj,
        english_name: {
          $contains: e.target.value,
        },
      },
    })
  }

  getContent() {
    const {prizeRedemptionList, redemption_code, exporting, isDesktop} = this.state
    const {getFieldDecorator} = this.props.form
    const statusMap = {
      pending: _('待核销'),
      redeemed: _('已核销'),
      closed: _('已过期'),
    }
    const PRIZE_LIST = {
      promotional_bundle: _('新人优惠大礼'),
      normal: _('普通奖品'),
    }
    const columnsPc = [
      {
        title: _('序号'),
        key: 'index',
        render: (val, row, index) => index + 1,
      },
      {
        title: _('状态'),
        dataIndex: 'status',
        render: (val, row, index) => {
          return statusMap[val]
        },
      },
      {
        title: _('名称'),
        key: 'name',
        render: (val, row, index) => {
          return row.prize.name
        },
      },
      {
        title: _('英文名称'),
        key: 'english_name',
        render: (val, row, index) => {
          return row.prize.english_name
        },
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
        title: _('兑换份数'),
        dataIndex: 'redemption_quantity',
        width: 80,
      },
      {
        title: _('兑换码'),
        dataIndex: 'redemption_code',
      },
      {
        title: _('兑换时间'),
        dataIndex: 'created_at',
        render: (val, row, index) => {
          return val ? utils.timeWithTimeZone(val * 1000).format(DATE_FORMAT) : '-'
        },
      },
      {
        title: _('核销时间'),
        dataIndex: 'redeemed_at',
        render: (val, row, index) => {
          return val ? utils.timeWithTimeZone(val * 1000).format(DATE_FORMAT) : '-'
        },
      },
      {
        title: _('过期时间'),
        dataIndex: 'closed_at',
        render: (val, row, index) => {
          return val ? utils.timeWithTimeZone(val * 1000).format(DATE_FORMAT) : '-'
        },
      },
      {
        title: _('操作人'),
        key: 'operator',
        render: (val, row, index) => {
          return (row.operator && row.operator.nickname) || '-'
        },
      },
      {
        fixed: 'right',
        title: _('操作'),
        key: 'op',
        render: (val, row, index) => (
          <div>
            <Button type='primary' ghost style={{marginBottom: 8, marginRight: 8}}>
              <NavLink to={generatePath(routePath.convertDetail, {id: row.id})}>{_('查看')}</NavLink>
            </Button>
            {row.status === 'pending' ? (
              <Button type='danger' ghost onClick={() => this.handleChangeStatus(row)}>
                {_('核销')}
              </Button>
            ) : null}
          </div>
        ),
      },
    ].map((i, index) => {
      i.width = columnsWidth[index]
      return i
    })

    const columnsMobile = [
      {
        title: _('兑换码'),
        dataIndex: 'redemption_code',
      },
      {
        title: _('状态'),
        dataIndex: 'status',
        render: (val, row, index) => {
          return statusMap[val]
        },
      },
      {
        title: _('名称'),
        key: 'english_name',
        render: (val, row, index) => {
          return row.prize.english_name
        },
      },
      {
        title: _('操作'),
        key: 'op',
        render: (val, row, index) => (
          <div>
            {row.status === 'pending' ? (
              <Button type='danger' size='small' ghost onClick={() => this.handleChangeStatus(row)}>
                {_('核销')}
              </Button>
            ) : null}
          </div>
        ),
      },
    ].map((i, index) => {
      i.width = columnsWidth[index]
      return i
    })

    const breadcrumbList = [['', _('订单管理')], ['', _('兑换记录')]]

    return (
      <React.Fragment>
        {isDesktop && <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 8}} />}
        <Form>
          {_('兑换码')}：
          {getFieldDecorator('redemption_code', {
            initialValue: redemption_code,
          })(
            <Input
              placeholder={_('请输入兑换码')}
              autoFocus
              style={{width: 300, marginRight: 20, marginBottom: 10}}
              type='text'
              className='redemption-code-input'
              onChange={this.handleCodeInput}
            />
          )}
          {!isDesktop && (
            <Button style={styl.logOut} size='small' onClick={this.handleSignOut} type='danger' ghost>
              {_('退出登录')}
            </Button>
          )}
          {isDesktop && (
            <span>
              {_('状态')}：
              {getFieldDecorator('status')(
                <Select placeholder={_('选择状态')} style={styl.select} onChange={this.handleStatusChange}>
                  <Option value='all'>{_('全部')}</Option>
                  <Option value='redeemed'>{_('已核销')}</Option>
                  <Option value='closed'>{_('已过期')}</Option>
                  <Option value='pending'>{_('待核销')}</Option>
                </Select>
              )}
            </span>
          )}
          <br />
          {isDesktop && (
            <span>
              {_('英文名称')}：
              {getFieldDecorator('english_name')(
                <Input
                  placeholder={_('请输入英文名称')}
                  style={{width: 220, marginRight: 20, marginBottom: 10}}
                  type='text'
                  className='redemption-code-input'
                  onChange={this.handleNameInput}
                />
              )}
              {_('奖品类型')}：
              {getFieldDecorator('type')(
                <Select placeholder={_('奖品类型')} style={styl.select} onChange={this.handleTypeChange}>
                  <Option value='all'>{_('全部')}</Option>
                  <Option value='normal'>{_('普通奖品')}</Option>
                  <Option value='promotional_bundle'>{_('新人优惠大礼')}</Option>
                </Select>
              )}
            </span>
          )}
          <br />
          {isDesktop && <div style={styl.exportTip}>{'Note: ' + _('优先按天筛选')}</div>}
          {isDesktop && (
            <div>
              {_('兑换时间') + ' (Day)'}：
              <DatePicker style={{marginRight: 20}} onChange={this.handleCreateDateChange} format='YYYY-MM-DD' />
              {_('兑换时间') + ' (Time range)'}：
              <RangePicker
                onChange={this.handleCreateDateRangeChange}
                style={styl.date}
                showTime={{format: 'HH:mm'}}
                format='YYYY-MM-DD HH:mm'
              />
            </div>
          )}
          {isDesktop && (
            <div>
              {_('核销时间') + ' (Day)'}：
              <DatePicker style={{marginRight: 20}} onChange={this.handleRedeemedDateChange} format='YYYY-MM-DD' />
              {_('核销时间') + ' (Time range)'}：
              <RangePicker
                onChange={this.handleRedeemedDateRangeChange}
                style={styl.date}
                showTime={{format: 'HH:mm'}}
                format='YYYY-MM-DD HH:mm'
              />
            </div>
          )}
          <Row align='middle' type='flex'>
            <Col style={{marginRight: 20}}>
              <Button type='primary' style={styl.btn} onClick={this.handleClickQuery}>
                {_('查询')}
              </Button>
            </Col>
            {isDesktop && (
              <Col style={{marginRight: 20, marginBottom: 20}}>
                <Spin spinning={exporting}>
                  <Button type='primary' disabled={exporting} onClick={this.exportListData}>
                    {_('导出列表')}
                  </Button>
                </Spin>
              </Col>
            )}
          </Row>
          {isDesktop && <div style={styl.exportTip}>{_('注意：导出列表操作频率最多为一分钟一次，否则会导出失败')}</div>}
        </Form>
        <Table
          style={{backgroundColor: '#fff', width: '100%'}}
          pagination={this.pagination}
          rowKey={(row, index) => index}
          columns={isDesktop ? columnsPc : columnsMobile}
          scroll={isDesktop ? {x: columnsWidth.reduce((count, i) => count + i)} : {}}
          dataSource={prizeRedemptionList}
        />
      </React.Fragment>
    )
  }

  render() {
    const {isDesktop} = this.state
    const content = this.getContent()

    if (!isDesktop) {
      return ReactDOM.createPortal(content, this.mobileNode)
    } else {
      return content
    }
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px', display: 'flex', justifyContent: 'space-between'},
  select: {
    width: 200,
    marginRight: 10,
  },
  btn: {
    marginBottom: 20,
    marginRight: 20,
  },
  date: {
    width: 320,
    marginBottom: 20,
    marginRight: 20,
  },
  exportTip: {
    color: '#999',
    fontSize: 14,
    marginBottom: 20,
  },
  logOut: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
}

export default Form.create()(ConvertList)
