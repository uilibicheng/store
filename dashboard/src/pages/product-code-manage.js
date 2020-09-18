import React from 'react'
import {DATE_FORMAT, TABLE_ID, CLOUD_FUNCTION_NAME, TIMEZONE} from '../config/constants'
import utils from '../utils'
import baseIO from '../io'
import {Table, Select, Button, Popconfirm, Form, DatePicker, message, Tag, Spin, Row, Col} from 'antd'
import RouteBreadcrumb from '../components/router-breadcrumb'
import {_} from 'i18n-utils'
import moment from 'moment-timezone'

const LIMIT = 20
const Option = Select.Option
const {RangePicker} = DatePicker
const columnsWidth = [100, 150, 150, 150, 120, 100, 150, 150, 150, 150, 150]

let timer = null

class ProductCodeManage extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inventoryList: [],
      ticketBundleList: [],
      ticketTypeList: [],
      total: 0,
      name: '',
      type: '',
      status: '',
      startDate: '',
      endDate: '',
      queryObj: {},
      selectedRows: [],
      fileDownLoadUrl: '',
      exporting: false,
    }
  }

  componentDidMount() {
    this.getTicketBundleList()
    this.getTicketTypeList()
    this.getInventoryList({
      where: {
        is_deleted: false,
      },
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
          is_deleted: false,
        },
        tableId: TABLE_ID.TICKET_INVENTORY,
        scientificNotationConvertKeys: ['barcode'],
        includeKeys: [
          'order_number',
          'package_name',
          'origin_type',
          'barcode',
          'sold',
          'order_id',
          'trade_no',
          'generated_at',
          'expires_at',
          'status',
          'is_refunded',
        ],
        customizeHeaders: {
          order_number: _('票务系统订单号'),
          order_id: _('关联订单号'),
          trade_no: _('支付流水号'),
          // QFPay_order_no: 'QFPay order number',
          package_name: _('门票名称'),
          origin_type: _('票种'),
          barcode: _('二维码'),
          sold: _('是否售出') + '(1:true/0:false)',
          status: _('状态'),
          generated_at: _('有效期开始时间'),
          expires_at: _('有效期结束时间'),
          is_refunded: _('已退款'),
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

  getInventoryList(params) {
    baseIO
      .getTicketInventoryList(params)
      .then(res => {
        const data = res.data.objects
        this.setState({
          inventoryList: data || [],
          total: res.data.meta.total_count,
        })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  getTicketTypeList() {
    baseIO.getTicketTypeList().then(res => {
      this.setState({
        ticketTypeList: res.data.objects,
      })
    })
  }

  getTicketBundleList() {
    baseIO
      .getTicketBundleList()
      .then(res => {
        this.setState({
          ticketBundleList: res.data.objects,
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
        this.getInventoryList({
          where: {
            is_deleted: false,
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

  get rowSelection() {
    const {selectedRowKeys} = this.state
    return {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRows,
          selectedRowKeys,
        })
      },
      getCheckboxProps: record => ({
        disabled: record.sold === 1,
        name: record.name,
      }),
    }
  }

  handleClickQuery = () => {
    this.props.form.validateFields((err, vals) => {
      if (!err) {
        let queryObj = {}
        if (vals.name === 'all') {
          delete queryObj.bundle
        } else if (vals.name) {
          queryObj.bundle = vals.name
        }

        if (vals.type === 'all') {
          delete queryObj.type
        } else if (vals.type) {
          queryObj.type = vals.type
        }

        if (vals.status === 'all') {
          delete queryObj.sold
        } else if (vals.status === '0') {
          queryObj.sold = 0
        } else if (vals.status === '1') {
          queryObj.sold = 1
          queryObj.is_refunded = {
            $ne: true,
          }
        } else if (vals.status === '2') {
          queryObj.sold = 1
          queryObj.is_refunded = true
        }

        if (Object.keys(this.expires_at).length) {
          queryObj.expires_at = this.expires_at
        } else {
          delete queryObj.expires_at
        }

        if (Object.keys(this.generated_at).length) {
          queryObj.generated_at = this.generated_at
        } else {
          delete queryObj.generated_at
        }

        this.setState({
          queryObj,
        })

        this.getInventoryList({
          where: {
            is_deleted: false,
            ...queryObj,
          },
          offset: 0,
          limit: LIMIT,
        })
        this.setState({
          currentPage: 1,
        })
      }
    })
  }

  //  批量删除
  deleteRecord = () => {
    const {selectedRows, queryObj} = this.state
    let idArr = []
    selectedRows.forEach(v => {
      if (v.sold === 0) {
        idArr.push(v.id)
      }
    })

    baseIO
      .deleteTicketInventoryList({
        where: {
          id: {
            $in: idArr,
          },
        },
      })
      .then(() => {
        message.success(_('删除成功'))
        this.setState({
          selectedRowKeys: [],
          currentPage: 1,
          selectedRows: [],
        })
        this.getInventoryList({
          where: {
            is_deleted: false,
            ...queryObj,
          },
          offset: 0,
          limit: LIMIT,
        })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  handleNameChange = e => {
    const {queryObj} = this.state
    this.setState({
      queryObj: {
        ...queryObj,
        bundle: e,
      },
    })
  }

  handleTicketTypeChange = e => {
    const {queryObj} = this.state
    this.setState({
      queryObj: {
        ...queryObj,
        type: e,
      },
    })
  }

  handleStatusChange = e => {
    const {queryObj} = this.state
    this.setState({
      queryObj: {
        ...queryObj,
        sold:
          e === '0'
            ? 0
            : {
              $gte: 1,
            },
      },
    })
  }

  get generated_at() {
    let params = {}
    if (Array.isArray(this.generatedDateRange) && this.generatedDateRange.length) {
      const rangeObj = {}
      this.generatedDateRange[0] && (rangeObj['$gte'] = utils.dateWithFormated(this.generatedDateRange[0]))
      this.generatedDateRange[1] && (rangeObj['$lte'] = utils.dateWithFormated(this.generatedDateRange[1]))

      params = rangeObj
    }

    if (this.generatedDate) {
      params = {}
      let rangeObj = {}
      let selectTime = utils.valueWithTimeZone(this.generatedDate)
      const gtTime = selectTime
      const ltTime = selectTime + 24 * 60 * 60 * 1000
      rangeObj = {
        $gte: utils.dateWithFormated(gtTime),
        $lt: utils.dateWithFormated(ltTime),
      }

      params = rangeObj
    }

    return params
  }

  handleGeneratedDateChange = (time, dateString) => {
    this.generatedDate = dateString
  }

  handleGeneratedDateRangeChange = (time, date) => {
    this.generatedDateRange = date
    console.log(this.generatedDateRange)
  }

  get expires_at() {
    let params = {}
    if (Array.isArray(this.expiresDateRange) && this.expiresDateRange.length) {
      const rangeObj = {}
      this.expiresDateRange[0] && (rangeObj['$gte'] = utils.dateWithFormated(this.expiresDateRange[0]))
      this.expiresDateRange[1] && (rangeObj['$lte'] = utils.dateWithFormated(this.expiresDateRange[1]))

      params = rangeObj
    }

    if (this.expiresDate) {
      let rangeObj = {}
      let selectTime = utils.valueWithTimeZone(this.expiresDate)
      const gtTime = selectTime
      const ltTime = selectTime + 24 * 60 * 60 * 1000
      rangeObj = {
        $gte: utils.dateWithFormated(gtTime),
        $lt: utils.dateWithFormated(ltTime),
      }

      params = rangeObj
    }

    return params
  }

  handleExpiresDateChange = (time, dateString) => {
    // 获得年月日0点0分
    this.expiresDate = dateString
  }

  handleExpiresDateRangeChange = (time, date) => {
    this.expiresDateRange = date
  }

  handleDateChange = e => {
    const {queryObj} = this.state

    this.setState({
      queryObj: {
        ...queryObj,
        generated_at: {
          $gt: e[0],
          $lt: e[1],
        },
      },
    })
  }

  render() {
    const {inventoryList, ticketBundleList, ticketTypeList, selectedRows, exporting} = this.state
    const {getFieldDecorator} = this.props.form
    const breadcrumbList = [['', _('二维码管理')], ['', _('二维码列表')]]

    const columns = [
      {
        fixed: 'left',
        title: _('序号'),
        key: 'index',
        render: (val, row, index) => index + 1,
      },
      {
        title: _('票务系统订单号'),
        dataIndex: 'order_number',
      },
      {
        title: _('门票名称'),
        dataIndex: 'name',
        render: (val, row, index) => {
          return (
            <div>
              <div>{row.bundle.name}</div>
              <div>{row.bundle.english_name}</div>
            </div>
          )
        },
      },
      {
        title: _('票种'),
        dataIndex: 'price',
        render: (val, row, index) => {
          return <Tag>{`${row.type.name} - ${row.type.english_name}`}</Tag>
        },
      },
      {
        title: _('二维码'),
        dataIndex: 'barcode',
      },
      {
        title: _('状态'),
        dataIndex: 'sold',
        render: (val, row, index) => {
          return val ? <Tag>{_('已售出') + (row.is_refunded ? `(${_('已退款')})` : '')}</Tag> : <Tag>{_('未售出')}</Tag>
        },
      },
      {
        title: _('关联订单号'),
        dataIndex: 'order_id',
        render: val => val || '-',
      },
      {
        title: _('支付流水号'),
        dataIndex: 'trade_no',
        render: val => val || '-',
      },
      // {
      //   title: 'QFPay order number',
      //   dataIndex: 'QFPay_order_no',
      //   render: val => val || '-',
      // },
      {
        title: _('有效期开始时间'),
        dataIndex: 'generated_at',
        render: (val, row, index) => {
          return utils.timeWithTimeZone(val).format(DATE_FORMAT)
        },
      },
      {
        title: _('有效期结束时间'),
        dataIndex: 'expires_at',
        render: (val, row, index) => {
          return utils.timeWithTimeZone(val).format(DATE_FORMAT)
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
            <Select placeholder={_('选择门票名称')} style={styl.select} onChange={this.handleNameChange}>
              <Option value='all'>{_('全部')}</Option>
              {ticketBundleList.map(item => {
                return (
                  <Option key={item.id} value={item.id}>
                    {`${item.name} - ${item.english_name}`}
                  </Option>
                )
              })}
            </Select>
          )}
          {getFieldDecorator('type')(
            <Select placeholder={_('选择票种')} style={styl.select} onChange={this.handleTicketTypeChange}>
              <Option value='all'>{_('全部')}</Option>
              {ticketTypeList.map((item, index) => {
                return (
                  <Option value={item.id} key={index}>
                    {`${item.name} - ${item.english_name}`}
                  </Option>
                )
              })}
            </Select>
          )}
          {getFieldDecorator('status')(
            <Select placeholder={_('选择状态')} style={styl.select} onChange={this.handleStatusChange}>
              <Option value='all'>{_('全部')}</Option>
              <Option value='1'>{_('已售出')}</Option>
              <Option value='0'>{_('未售出')}</Option>
              <Option value='2'>{_('已售出') + '-' + _('已退款')}</Option>
            </Select>
          )}
          <div style={styl.exportTip}>{'Note: ' + _('优先按天筛选')}</div>
          <Row>
            <Col span={8}>
              {_('有效期开始时间') + ' (Day)'}：
              <DatePicker onChange={this.handleGeneratedDateChange} format='YYYY-MM-DD' />
            </Col>
            <Col span={14}>
              {_('有效期开始时间') + ' (Time range)'}：
              <RangePicker
                onChange={this.handleGeneratedDateRangeChange}
                style={styl.btn}
                showTime={{format: 'HH:mm'}}
                format='YYYY-MM-DD HH:mm'
              />
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              {_('有效期结束时间') + ' (Day)'}：
              <DatePicker onChange={this.handleExpiresDateChange} format='YYYY-MM-DD' />
            </Col>
            <Col span={14}>
              {_('有效期结束时间') + ' (Time range)'}：
              <RangePicker
                onChange={this.handleExpiresDateRangeChange}
                style={styl.btn}
                showTime={{format: 'HH:mm'}}
                format='YYYY-MM-DD HH:mm'
              />
            </Col>
          </Row>
          <Button type='primary' style={styl.btn} onClick={this.handleClickQuery}>
            {_('查询')}
          </Button>
        </Form>
        <Row align='middle' type='flex'>
          <Col style={{marginRight: 20, marginBottom: 20}}>
            <Popconfirm
              title={_('是否已经备份导出对应的数据')}
              okText={_('是')}
              cancelText={_('否')}
              disabled={!selectedRows.length}
              onConfirm={this.deleteRecord}
            >
              <Button type='primary' disabled={!selectedRows.length}>
                {_('批量删除')}
              </Button>
            </Popconfirm>
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
          rowSelection={this.rowSelection}
          rowKey={(row, index) => row.id}
          columns={columns}
          dataSource={inventoryList}
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

export default Form.create()(ProductCodeManage)
