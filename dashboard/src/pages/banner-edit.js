import React from 'react'
import baseIO from '../io'
import routePath from '../config/route-path'
import {FILE_GROUP_ID} from '../config/constants'
import {FormItem, TailFormItem} from '../components/base-form'
import UploaderFormItem from '../components/formitem-uploader'
import RouterBreadcrumb from '../components/router-breadcrumb'
import {Input, Form, message, Button, Table} from 'antd'
import {_} from 'i18n-utils'

const columns = [
  {
    title: _('跳转页面'),
    key: 'page',
    width: 200,
    render: (val, row, index) => row.page,
  },
  {
    title: _('跳转地址'),
    key: 'url',
    width: 300,
    render: (val, row, index) => row.url,
  },
  {
    title: _('示例'),
    key: 'example',
    width: 400,
    render: (val, row, index) => row.example,
  },
]

const dataSource = [
  {
    page: _('门票列表'),
    url: 'pages/ticket-bundle-list/ticket-bundle-list',
    example: 'pages/ticket-bundle-list/ticket-bundle-list',
  },
  {
    page: _('优惠门票列表'),
    url: 'pages/discount-ticket-list/discount-ticket-list',
    example: 'pages/discount-ticket-list/discount-ticket-list',
  },
  {
    page: _('门票详情'),
    url: 'pages/ticket/ticket?id=xxx',
    example: 'pages/ticket/ticket?id=5c2c614faa991d2ca5673f78',
  },
  {
    page: _('奖品列表'),
    url: 'pages/prize-list/prize-list',
    example: 'pages/prize-list/prize-list',
  },
  {
    page: _('奖品详情'),
    url: 'pages/prize/prize?id=xxx',
    example: 'pages/prize/prize?id=5c2c614faa991d2ca5673f79',
  },
]

class BannerEditController extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      productList: [],
      id: null,
      name: '',
      loading: true,
      redirectUrl: '',
      imageUrl: '',
      banner: [],
      settingsId: '',
    }
  }

  componentDidMount() {
    const {match} = this.props
    const id = match.params.id
    this.getSettings()
    this.setState({
      id: id || null,
    })
    if (!id) {
      this.setState({
        loading: false,
      })
    }
  }

  getSettings() {
    baseIO
      .getSettingList()
      .then(res => {
        const data = res.data.objects[0]
        this.setState({
          loading: false,
          settingsId: data.id,
          banner: data.banner,
          imageUrl: this.state.id ? data.banner[this.state.id].img : '',
          redirectUrl: this.state.id ? data.banner[this.state.id].url : '',
        })
      })
      .catch(err => {
        this.setState({
          loading: false,
        })
        throw new Error(err)
      })
  }

  handleClickCancel = () => {
    this.props.history.goBack()
  }

  handleClickSave = () => {
    const {id, banner, settingsId, loading} = this.state
    if (loading) return
    this.props.form.validateFields((err, vals) => {
      if (!err) {
        const img = vals.imageUrl[0]
        const bannerObj = {
          img: img.url ? img.url : img,
          url: vals.redirectUrl,
        }
        if (id) {
          banner[id] = bannerObj
        } else {
          banner.push(bannerObj)
        }

        baseIO
          .updateSetting(settingsId, {banner, opt_id: id, opt_type: 'banner'}) // opt_id 记录日志时使用
          .then(res => {
            if (res.status === 200) {
              this.setState({
                loading: false,
              })
              message.success(_('保存成功'))
              this.props.history.push({pathname: routePath.bannerList})
            }
          })
          .catch(err => {
            this.setState({
              loading: false,
            })
            message.success(_('保存失败'))
            throw new Error(err)
          })
      }
    })
  }

  render() {
    const {redirectUrl, imageUrl, id, loading} = this.state
    const {getFieldDecorator} = this.props.form

    const breadcrumbList = [
      ['', _('设置')],
      [routePath.bannerList, _('banner 设置')],
      ['', id ? _('编辑 banner') : _('新增 banner')],
    ]

    dataSource.forEach(i => {
      i.page = _(i.page)
    })

    columns.forEach(i => {
      i.title = _(i.title)
    })

    return loading ? null : (
      <React.Fragment>
        <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 8}} />
        <Form>
          <FormItem label={`${_('banner 图')}`}>
            {getFieldDecorator('imageUrl', {
              initialValue: imageUrl ? [imageUrl] : [],
              rules: [
                {
                  required: true,
                  message: _('请上传 banner 图'),
                },
              ],
            })(
              <UploaderFormItem
                categoryId={FILE_GROUP_ID.BANNER}
                msg={_('支持 PNG，JPG，图片大小不超过 200 K，建议像素为') + ' 327 * 184'}
                name='cover'
                listType='picture-card'
                showUploadList={false}
                beforeUpload={() => false}
              />
            )}
          </FormItem>
          <FormItem label={`${_('跳转地址')}`}>
            {getFieldDecorator('redirectUrl', {
              initialValue: redirectUrl,
            })(<Input type='text' style={{width: 300}} />)}
          </FormItem>

          <TailFormItem>
            <Button style={styl.formBtn} type='default' onClick={this.handleClickCancel}>
              {_('取消')}
            </Button>
            <Button style={styl.formBtn} type='primary' onClick={this.handleClickSave}>
              {_('保存')}
            </Button>
          </TailFormItem>
        </Form>
        <Table
          style={{backgroundColor: '#fff'}}
          pagination={false}
          rowKey={(row, index) => index}
          columns={columns}
          dataSource={dataSource}
        />
      </React.Fragment>
    )
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px'},
  formBtn: {
    width: 100,
    marginRight: 50,
  },
  uploadTip: {
    color: '#999',
    marginLeft: 150,
    marginBottom: 30,
    fontSize: '12px',
  },
  uploadBtn: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 0,
  },
  bannerImg: {
    width: 300,
  },
}

export default Form.create()(BannerEditController)
