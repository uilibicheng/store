import React from 'react'
import {NavLink, generatePath} from 'react-router-dom'
import utils from '../utils'
import routePath from '../config/route-path'
import {CURRENCY} from '../config/enums'
import baseIO from '../io'
import {TIMEZONE, CLOUD_FUNCTION_NAME, REGEXP_BARCODE} from '../config/constants'
import momentTimezone from 'moment-timezone'
import template from '../assets/template/template.csv'
import {Table, Button, message, Tag, Row, Col, Spin} from 'antd'
import RouteBreadcrumb from '../components/router-breadcrumb'
import {_} from 'i18n-utils'

const MAX_LENGTH = 1000 //  一次操作最大导入数据条数
const LIMIT = 20

export default class ProductListController extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      productList: [],
      total: 0,
      enableInventoryWarning: false, // 是否启用库存预警
      inventoryWarningThreshold: 0, // 库存预警值
      hasSendEmailList: [],
      settingsId: '',
      rawData: [],
      currentRecord: {},
      refreshing: false,
    }
  }

  componentDidMount() {
    this.getProductList({
      offset: 0,
      limit: LIMIT,
    })
    this.getSettings()
  }

  updateInventory() {
    return baseIO.invokeCloudFunction(CLOUD_FUNCTION_NAME.CHECK_TICKET_INVENTORY)
  }

  getProductList(params) {
    baseIO
      .getProductList(params)
      .then(res => {
        const data = res.data.objects
        this.setState({
          productList: data,
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
      onChange: (page, size) =>
        this.getProductList({
          offset: (page - 1) * size,
          limit: size,
        }),
    }
  }

  getSettings() {
    baseIO
      .getSettingList()
      .then(res => {
        let data = res.data.objects[0]
        data &&
          this.setState({
            enableInventoryWarning: data.enable_inventory_warning,
            inventoryWarningThreshold: data.inventory_warning_threshold,
            hasSendEmailList: data.has_send_email_list || [],
            settingsId: data.id,
          })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  readFile = record => {
    console.log('record', record)
    const reader = new FileReader()
    reader.readAsText(document.getElementById(record.id).files[0], 'UTF-8')
    reader.onload = e => {
      this.setState({
        currentRecord: record,
        rawData: utils.convertToTable(e.target.result),
      })

      this.handleOk(record)
    }
  }

  handleOk = currentRecord => {
    const {rawData, hasSendEmailList, settingsId} = this.state
    console.log('state', this.state)
    let resourceArr = []
    let flag = false
    rawData.forEach(item => {
      if (item[1] !== currentRecord.bundle.english_name || item[2] !== currentRecord.type.english_name) {
        flag = true
      }
      let barcode = item[3]
      // 数据导入列顺序：初始订单号/产品包/票种/产品编码/初始状态/日期
      if (item[1] === currentRecord.bundle.english_name && item[2] === currentRecord.type.english_name) {
        let obj = {}
        obj.order_number = item[0]
        obj.package_name = item[1]
        obj.origin_type = item[2]
        obj.barcode = REGEXP_BARCODE.exec(barcode)[0]
        obj.status = item[4]
        obj.type = currentRecord.type.id
        obj.generated_at = momentTimezone.tz(item[5], 'YYYY/MM/DD', TIMEZONE).format()
        obj.expires_at = momentTimezone
          .tz(item[5], 'YYYY/MM/DD', TIMEZONE)
          .add(90, 'days')
          .format()
        obj.bundle = currentRecord.bundle.id
        obj.ticket = currentRecord.id
        obj.sku = currentRecord.sku
        resourceArr.push(obj)
      }
    })

    console.log('resourceArr', resourceArr)

    if (flag || !resourceArr.length) {
      document.getElementById(currentRecord.id).value = null
      return message.error(_('数据导入失败'))
    }

    this.handleUploadListData(resourceArr).then(res => {
      document.getElementById(currentRecord.id).value = null
      message.success(_('数据导入成功'))
      this.updateInventory().then(res => {
        if (res.data.code === 0) {
          const index = hasSendEmailList.findIndex(v => v === currentRecord.id)
          if (index > -1) {
            hasSendEmailList.splice(index, 1)
            baseIO.updateSetting(settingsId, {has_send_email_list: hasSendEmailList})
          }
          message.success(_('库存已更新'))
          this.getProductList({
            offset: 0,
            limit: LIMIT,
          })
        }
      })
    })
  }

  handleUploadListData(resourceArr) {
    let len = resourceArr.length
    let group = Math.ceil(len / MAX_LENGTH) // 数据量大时分组导入数据
    let sliceArr = []
    for (let i = 0; i < group; i++) {
      sliceArr.push(resourceArr.slice(i * MAX_LENGTH, (i + 1) * MAX_LENGTH))
    }
    let promises = sliceArr.map(dataListSlice => {
      return baseIO.uploadFileData(dataListSlice)
    })

    return Promise.all(promises)
  }

  handleChangeStatus = record => {
    baseIO
      .updateProductRecord(record.id, {is_active: !record.is_active})
      .then(res => {
        if (res.status === 200) {
          message.success(record.is_active ? _('下架成功') : _('上架成功'))
          this.getProductList()
        }
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  render() {
    const {productList, enableInventoryWarning, refreshing, inventoryWarningThreshold} = this.state
    const columns = [
      {
        title: _('序号'),
        key: 'index',
        width: 120,
        render: (val, row, index) => index + 1,
      },
      {
        title: _('门票名称'),
        key: 'name',
        width: 200,
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
        title: _('票种'),
        dataIndex: 'type',
        render: (val, row, index) => {
          return <Tag>{`${row.type.name} (${row.type.english_name})`}</Tag>
        },
      },
      {
        title: _('票价'),
        dataIndex: 'price',
        width: 120,
        render: (val, row, index) => {
          return `${CURRENCY[row.currency]}${val}`
        },
      },
      {
        title: _('Accesso Product ID'),
        dataIndex: 'accesso_product_id',
        width: 200,
        render: (val, row, index) => {
          return row.bundle.accesso_product_id
        },
      },
      {
        title: _('状态'),
        width: 120,
        dataIndex: 'is_active',
        render: (val, row, index) => (val ? _('已上架') : _('已下架')),
      },
      {
        title: _('库存'),
        dataIndex: 'inventory',
        width: 160,
        render: (val, row, index) => {
          if (enableInventoryWarning && inventoryWarningThreshold >= val) {
            return (
              <div style={{color: 'red', textAlign: 'center'}}>
                {val}
                <p style={styl.warn}>{_('库存紧张')}</p>
              </div>
            )
          } else {
            return <div style={{textAlign: 'center'}}>{val}</div>
          }
        },
      },
      {
        title: _('操作'),
        key: 'action',
        render: (text, record) => (
          <span>
            <Button ghost type='primary' style={{marginRight: 8, marginBottom: 8}}>
              <input
                type='file'
                id={'' + record.id}
                style={styl.inputFile}
                onChange={() => {
                  this.readFile(record)
                }}
              />
              {_('导入')}
            </Button>
            <br />
            <Button ghost type='danger' style={{marginRight: 8, marginBottom: 8}}>
              <a onClick={() => this.handleChangeStatus(record)}>{record.is_active ? _('下架') : _('上架')}</a>
            </Button>
            <br />
            <Button ghost type='primary'>
              <NavLink to={generatePath(routePath.productEdit, {id: record.id})}>{_('编辑')}</NavLink>
            </Button>
          </span>
        ),
      },
    ]
    const breadcrumbList = [['', _('产品管理')], ['', _('产品列表')]]

    return (
      <React.Fragment>
        <div style={styl.breadcrumb}>
          <RouteBreadcrumb data={breadcrumbList} style={{marginBottom: 20}} />
          <Row align='middle' type='flex'>
            <Col style={{marginRight: 20}}>
              <Button type='primary'>
                <a href={template} download='template.csv'>
                  {_('模版下载')}
                </a>
              </Button>
            </Col>
            <Col style={{marginRight: 20}}>
              <Spin spinning={refreshing}>
                <Button
                  type='primary'
                  disabled={refreshing}
                  onClick={() => {
                    this.setState({
                      refreshing: true,
                    })
                    this.updateInventory()
                      .then(res => {
                        if (res.data.code === 0) {
                          this.setState({
                            refreshing: false,
                          })
                          message.success(_('库存量将在5分钟后自动更新数据'))
                        }
                      })
                      .catch(() => {
                        message.error(_('刷新失败'))
                        this.setState({
                          refreshing: false,
                        })
                      })
                  }}
                >
                  {_('刷新库存')}
                </Button>
              </Spin>
            </Col>
            <Col style={{marginRight: 20}}>
              <Button
                type='primary'
                onClick={() => {
                  this.props.history.push({pathname: generatePath(routePath.productEdit)})
                }}
              >
                {_('新增产品')}
              </Button>
            </Col>
          </Row>
        </div>
        <Table
          style={{backgroundColor: '#fff'}}
          pagination={this.pagination}
          rowKey={(row, index) => index}
          columns={columns}
          dataSource={productList}
        />
      </React.Fragment>
    )
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px', display: 'flex', justifyContent: 'space-between'},
  warn: {
    color: '#fff',
    backgroundColor: 'red',
    paddingLeft: 6,
    paddingRight: 6,
    marginLeft: 10,
  },
  aFile: {
    position: 'relative',
    display: 'block',
    width: '100%',
    height: '32px',
    lineHeight: '32px',
  },
  inputFile: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0,
    width: 74,
    height: 32,
    cursor: 'pointer',
  },
}
