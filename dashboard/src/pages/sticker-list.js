import React from 'react'
import {NavLink, generatePath} from 'react-router-dom'
import utils from '../utils'
import routePath from '../config/route-path'
import {DATE_FORMAT, CLOUD_FUNCTION_NAME} from '../config/constants'
import io from '../io'
import {_} from 'i18n-utils'
import RouterBreadcrumb from '../components/router-breadcrumb'
import {Table, Button, message, Modal, InputNumber, Icon} from 'antd'

const LIMIT = 10
const successModal = Modal.success
const confirm = Modal.confirm

class EditableCell extends React.PureComponent {
  state = {
    value: this.props.value,
    editable: false,
  }

  handleChange = value => {
    this.setState({
      value: value,
    })
  }

  confirm = () => {
    this.setState({editable: false})
    if (this.props.onChange) {
      this.props.onChange(this.state.value)
    }
  }

  edit = () => {
    this.setState({editable: true})
  }

  render() {
    const {value, editable} = this.state
    
    return (
      <div>
        {
          editable ? 
            <div>
              <InputNumber
                value={value}
                min={0}
                style={{width: 80}}
                onChange={this.handleChange}
              />
              <Icon
                type='check'
                style={{paddingLeft:20,width: 30, cursor: 'pointer'}}
                onClick={this.confirm}
              />
            </div>
          :
            <div>
              <p style={{width: 70,display: 'inline-block', textAlign: 'center'}}>{value}</p>
              <Icon
                type='edit'
                style={{paddingLeft:30,width: 30, cursor: 'pointer'}}
                onClick={this.edit}
              />
            </div>
        }
      </div>
    )
  }
}

export default class StickerListController extends React.PureComponent {
  state = {
    stickerList: [],
    total: 0,
    loading: true,
    currentPage: 1,
  }

  componentDidMount() {
    this.getStickerList({
      offset: 0,
      limit: LIMIT,
    })
  }

  getStickerList(params) {
    this.setState({
      loading: true
    })
    let data = {
      ...params,
      order_by: '-priority',
      where: {
        status : {
          $eq: 'active'
        }
      },
    }
    io.getStickerList(data)
      .then(res => {
        const data = res.data.objects
        const meta = res.data.meta
        this.setState({
          stickerList: data,
          total: res.data.meta.total_count,
          loading: false,
          currentPage: meta.offset / meta.limit + 1,
        })
      })
  }

  get pagination() {
    const {total, currentPage} = this.state
    return {
      total,
      size: 'small',
      current: currentPage,
      pageSize: LIMIT,
      showTotal: total => {
        return _('共 {total} 条数据', {total})
      },
      showQuickJumper: true,
      onChange: (page, size) => {
        this.getStickerList({
          offset: (page - 1) * size,
          limit: size,
        })
      }
    }
  }

  generateQrcode = id => {
    const reqObj = {
      type: 'wxacode',
      params: {
        path: `pages/index/index?id=${id}`,
        width: 350,
      },
    }
    io.invokeCloudFunction(CLOUD_FUNCTION_NAME.GET_WX_QRCODE, reqObj)
      .then(({data}) => {
        const result = data.data
        if (!result) {
          return message.error(data.error.message || data.error.type)
        }
        const imageURL = result.imageBase64 || ''
        this.successModalHolder = successModal({
          title: _('点击图片下载小程序二维码'),
          content: (
            <a href={imageURL} download>
              <img src={imageURL} alt='贴纸二维码' style={{width: '100%', paddingRight: 38}} />
            </a>
          ),
        })
      })
      .catch(err => message.error(err.toString()))
  }

  handleDelete = id => {
    confirm({
      title: _('确认删除?'),
      content: '',
      calcelText: _('取消'),
      okText: _('确认'),
      onOk: () => {
        io.updateStickerRecord(id, {status: 'deleted'}).then(res => {
          message.success(_('删除成功'))
          this.getStickerList({
            offset: 0,
            limit: LIMIT,
          })
        })
      },
      onCancel() {},
    })
  }

  onPriorityChange = id => {
    return value => {
      let num = Number(value) ? Number(value) : 0
      io.updateStickerRecord(id, {priority: num})
        .then(() => {
          this.getStickerList({
            offset: 0,
            limit: LIMIT,
          })
        })
    }
  }

  render() {
    const {stickerList, loading} = this.state
    const columns = [
      {
        title: _('排序') + '（'  + _('数值越大，显示越靠前') + '）',
        dataIndex: 'priority',
        width: 250,
        render: (val, row) => {
          {
            return loading ? null :
               <EditableCell
                value={val}
                onChange={this.onPriorityChange(row.id)}
              />
          }
        }
      },
      {
        title: _('图片'),
        dataIndex: 'image',
        width: 150,
        render: (val, row, index) => {
          return <img src={val} alt='img' width={100} />
        },
      },
      {
        title: _('创建时间'),
        dataIndex: 'created_at',
        width: 300,
        render: (val, row, index) => {
          return utils.timeWithTimeZone(val * 1000).format(DATE_FORMAT)
        },
      },
      {
        title: _('操作'),
        key: 'action',
        width: 400,
        render: (text, record) => {
          return (
            <div>
              <Button type='primary' ghost style={{marginBottom: 8, marginRight: 8}}>
                <NavLink to={generatePath(routePath.stickerEdit, {id: record.id})}>{_('编辑')}</NavLink>
              </Button>
              <Button
                type='primary'
                ghost
                style={{marginBottom: 8, marginRight: 8}}
                onClick={() => this.generateQrcode(record.id)}>
                {_('二维码')}
              </Button>
              <Button type='danger' ghost onClick={() => this.handleDelete(record.id)}>
                {_('删除')}
              </Button>
            </div>
          )
        },
      },
    ]

    const breadcrumbList = [['', _('贴纸管理')], ['', _('贴纸列表')]]

    return (
      <React.Fragment>
        <div style={styl.breadcrumb}>
          <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 8}} />
          <Button
            type='primary'
            onClick={() => {
              this.props.history.push({pathname: generatePath(routePath.stickerEdit)})
            }}>
            {_('新增贴纸')}
          </Button>
        </div>
        <Table
          style={{backgroundColor: '#fff'}}
          pagination={this.pagination}
          rowKey={(row, index) => index}
          columns={columns}
          dataSource={stickerList}
        />
      </React.Fragment>
    )
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px', display: 'flex', justifyContent: 'space-between'},
}