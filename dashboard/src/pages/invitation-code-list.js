import React from 'react'
import {withRouter} from 'react-router-dom'
import {Button, Popconfirm, message, Modal, Form, DatePicker} from 'antd'
import moment from 'moment'
import shortid from 'shortid'
import QRCode from 'qrcode'

import io from '../io'
import {DATE_FORMAT, FILE_GROUP_ID} from '../config/constants'
import utils from '../utils'
import FormItem from '../components/form-item'
import withBaseTable from '../components/with-base-table'

const db = io.invitationCode

class InvitationCodeList extends React.PureComponent {
  state = {
    meta: {},
    dataSource: [],
    formData: {},
    visible: false,
    imgVisible: false,
  }

  componentDidMount() {
    this.getDataSource()
  }

  getDataSource(params = {offset: 0, limit: 10}) {
    return db.find(params).then(res => {
      const meta = res.data.meta
      const dataSource = res.data.objects
      this.setState({meta, dataSource})
      return res
    })
  }

  get id() {
    return this.state.formData.id
  }

  showModal = () => {
    this.setState({
      visible: true,
    })
  }

  hideModal = () => {
    this.setState({
      visible: false,
      formData: {},
    })
  }

  handleEdit = data => {
    this.setState({
      formData: data,
    })
    this.showModal()
  }

  handleDownload = file => {
    const image = new Image()
    image.setAttribute('crossOrigin', 'anonymous')
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0, image.width, image.height)
      const url = canvas.toDataURL('image/png')
      const $a = document.createElement('a')
      $a.style.display = 'none'
      $a.download = file.code
      $a.href = url
      document.body.appendChild($a)
      $a.click()
      document.body.removeChild($a)
    }
    image.onerror = () => {
      this.handleShowImgModal(file)
    }
    image.src = file.url
  }

  handleShowImgModal = file => {
    this.setState({
      imgVisible: true,
      imgSrc: file.url,
    })
  }

  handleCloseImgModal = () => {
    this.setState({
      imgVisible: false,
    })
  }

  handleDelete = id => {
    const {dataSource, meta} = this.state
    db.delete(id).then(() => {
      message.success('删除成功')
      utils.sendAdminOperationLog(this.props, '删除')
      const params = {...meta}
      if (dataSource.length === 1) {
        params.offset = params.offset - params.limit
      }
      this.getDataSource(params)
    })
  }

  generateCode = () => {
    const code = shortid.generate()
    return db.find({where: {code: {$eq: code}}}).then(res => {
      if (res.data.objects.length > 0) {
        return this.generateCode()
      }
      return code
    })
  }

  uploadCode = file => {
    return io.base
      .getUploadFileConfig({
        filename: file.name || '',
        category_id: FILE_GROUP_ID.INVITATION_CODE,
      })
      .then(res => {
        const config = res.data
        return io.base.uploadFile({...config, file}).then(res => {
          return config.path
        })
      })
  }

  handleSubmit = e => {
    const {
      form: {validateFields, resetFields},
    } = this.props
    e.preventDefault()
    validateFields((err, values) => {
      if (err) return
      const expired_at = moment(values.expired_at).unix()
      if (this.id) {
        db.update(this.id, {expired_at})
          .then(() => {
            utils.sendAdminOperationLog(this.props, '编辑')
          })
          .then(() => {
            message.success('编辑成功')
            this.hideModal()
            resetFields()
            this.getDataSource(this.state.meta)
          })
      } else {
        this.generateCode().then(res => {
          const code = res
          const canvas = document.getElementById('canvas')
          QRCode.toCanvas(canvas, code, err => {
            if (err) return
            canvas.toBlob(blob => {
              const file = new File([blob], `${code}.png`, {type: 'image/png'})
              this.uploadCode(file).then(path => {
                const params = {
                  ...this.state.formData,
                  expired_at,
                  url: path,
                  code,
                }
                db.create(params)
                  .then(() => {
                    utils.sendAdminOperationLog(this.props, '新增')
                  })
                  .then(() => {
                    message.success('生成成功')
                    this.hideModal()
                    resetFields()
                    this.getDataSource()
                  })
              })
            })
          })
        })
      }
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form
    const {visible, formData} = this.state
    const columns = [
      {
        title: '邀请码',
        dataIndex: 'url',
        width: 200,
        render: val => <img style={{width: 50, height: 50}} src={val} />,
      },
      {
        title: '邀请数字',
        dataIndex: 'code',
        width: 150,
      },
      {
        title: '使用状态',
        dataIndex: 'used',
        width: 100,
        render: val => (val ? '已使用' : '未使用'),
      },
      {
        title: '过期时间',
        dataIndex: 'expired_at',
        render: val => moment.unix(val).format(DATE_FORMAT),
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        render: val => moment.unix(val).format(DATE_FORMAT),
      },
      {
        title: '操作',
        key: 'action',
        render: (val, row) => (
          <>
            <Button type='primary' ghost style={{margin: '0px 8px'}} onClick={() => this.handleEdit(row)}>
              编辑
            </Button>
            <Button type='primary' ghost style={{margin: '0px 8px'}} onClick={() => this.handleDownload(row)}>
              下载邀请码
            </Button>
            <Popconfirm title='确认删除' onConfirm={() => this.handleDelete(row.id)}>
              <Button type='danger' ghost>
                删除
              </Button>
            </Popconfirm>
          </>
        ),
      },
    ]

    return (
      <>
        <BaseTable
          {...this.props}
          columns={columns}
          dataSource={this.state.dataSource}
          showModal={this.showModal}
          pagination={utils.pagination(this.state.meta, params => this.getDataSource(params))}
        />
        <Modal
          visible={visible}
          title='新增邀请码'
          okText='ok'
          cancelText='cancel'
          onCancel={this.hideModal}
          onOk={this.handleSubmit}
        >
          <FormItem label='过期时间'>
            {getFieldDecorator('expired_at', {
              initialValue: formData.expired_at ? moment(formData.expired_at * 1000) : null,
              rules: utils.form.setRules({type: 'object', message: '请选择过期时间'}),
            })(<DatePicker placeholder='请选择日期' format={DATE_FORMAT} showTime />)}
          </FormItem>
        </Modal>
        <Modal visible={this.state.imgVisible} title='查看二维码' onCancel={this.handleCloseImgModal} footer={null}>
          <div style={{textAlign: 'center'}}>
            <img src={this.state.imgSrc} style={{width: 200, height: 200}} />
          </div>
        </Modal>
        <canvas id='canvas' style={{display: 'none'}} />
      </>
    )
  }
}

const BaseTable = withBaseTable('', props => <Header {...props} />)

function Header(props) {
  return (
    <Button type='primary' onClick={props.showModal}>
      生成邀请码
    </Button>
  )
}

export default withRouter(Form.create()(InvitationCodeList))
