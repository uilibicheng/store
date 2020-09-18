import React from 'react'
import routePath from '../config/route-path'
import {FILE_GROUP_ID} from '../config/constants'
import {NavLink, withRouter} from 'react-router-dom'
import io from '../io'
import {_} from 'i18n-utils'

import {FormItem, TailFormItem} from '../components/base-form'
import UploaderFormItem from '../components/formitem-uploader'
import RouterBreadcrumb from '../components/router-breadcrumb'

import {Form, Input, Radio, message, Button, Checkbox} from 'antd'

const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group

class StickerEditController extends React.PureComponent {
  state = {
    has_lock: false,
    image: null,
    poi_image: null,
    unlock_method: ['share'],
    poi_name: '',
    loading: true
  }

  componentDidMount() {
    this.getStickerDetail()
  }

  getStickerDetail = () => {
    if (this.id) {
      io.getStickerDetail(this.id).then(({data}) => {
        this.setState({
          ...data,
          loading: false
        })
      })
    } else {
      this.setState({loading: false})
    }
  }

  get id() {
    const {match} = this.props
    const id = match.params.id
    return id && id.trim() ? id.trim() : null
  }

  handleUnlockChange = e => {
    this.setState({
      has_lock: e.target.value
    })
  }

  handleChangeWay = checkValues => {
    this.setState({
      unlock_method: checkValues
    })
  }

  getReqData = values => {
    const data = {...values}
    const {image, poi_image} = data
    if (image && image.length) {
      data.image = image.map(i => i.url || i)[0]
    }
    if (poi_image && poi_image.length) {
      data.poi_image = poi_image.map(i => i.url || i)[0]
    }
    if (!data.has_lock) {
      data.poi_image = ''
      data.unlock_method = ['share']
      data.poi_name = ''
    }
    return data
  }

  createStickerRecord = values => {
    return io.createStickerRecord(this.getReqData(values))
  }

  updateStickerRecord = values => {
    return io.updateStickerRecord(this.id, this.getReqData(values))
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {history} = this.props
        const req = this.id ? this.updateStickerRecord(values) : this.createStickerRecord(values)
        req.then(() => {
          history.push(routePath.stickerList)
        })
        .catch(e => {
          message.error(e.toString())
        })
      }
    })
  }

  render() {
    const text = this.id ? _('编辑贴纸') : _('新增贴纸')
    const breadcrumbList = [['', _('贴纸管理')], [routePath.stickerList, _('贴纸列表')], ['', text]]
    const {getFieldDecorator} = this.props.form
    const {
      has_lock,
      image,
      poi_image,
      unlock_method,
      poi_name,
      loading,
    } = this.state

    const options = [
      {label: _('扫码解锁'), value: 'scan_qrcode'},
      {label: _('分享解锁'), value: 'share'},
    ]

    return loading ? null : (
      <React.Fragment>
        <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 20}} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem label={_('是否需要解锁')}>
            {getFieldDecorator('has_lock', {
              initialValue: has_lock,
              rules: [
                {
                  required: true,
                  message: _('请选择是否需要解锁')
                },
              ],
            })(
              <RadioGroup onChange={this.handleUnlockChange}>
                <Radio value={false}>{_('否')}</Radio>
                <Radio value={true}>{_('是')}</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem label={_('展示小图')}>
            {getFieldDecorator('image', {
              initialValue: image ? [image] : [],
              rules: [
                {
                  required: true,
                  message: _('请选择展示小图')
                },
              ],
            })(
              <UploaderFormItem
                categoryId={FILE_GROUP_ID.STICKER}
                msg={_('支持 PNG，JPG，图片大小不超过 200 K，建议像素为') + ' 480 * 480'}
                name='cover'
                listType='picture-card'
                showUploadList={false}
                beforeUpload={() => false}
              />
            )}
          </FormItem>
          {has_lock && (
            <div>
              <FormItem label={_('解锁大图')}>
                {getFieldDecorator('poi_image', {
                  initialValue: poi_image ? [poi_image] : [],
                  rules: [
                    {
                      required: true,
                      message: _('请选择解锁大图')
                    },
                  ],
                })(
                  <UploaderFormItem
                    categoryId={FILE_GROUP_ID.STICKER}
                    msg={_('支持 PNG，JPG，图片大小不超过 200 K，建议像素为') + ' 670 * 890'}
                    name='cover'
                    listType='picture-card'
                    showUploadList={false}
                    beforeUpload={() => false}
                  />
                )}
              </FormItem>
              <FormItem label={_('解锁方式')}>
                {getFieldDecorator('unlock_method', {
                  initialValue: unlock_method,
                  rules: [
                    {
                      required: true,
                      message: _('请选择解锁方式')
                    }
                  ]
                })(
                  <CheckboxGroup options={options} value={unlock_method} onChange={this.handleChangeWay} />
                )}
              </FormItem>
              <FormItem label={_('扫码地点')}>
                {getFieldDecorator('poi_name', {
                  initialValue: poi_name,
                })(
                  <Input style={{width: 220}} />
                )}
              </FormItem>
            </div>
          )}
          <TailFormItem>
            <NavLink to={routePath.stickerList}>
              <Button style={{marginRight: 8}}>{_('取消')}</Button>
            </NavLink>
            <Button type='primary' htmlType='submit'>
              {_('保存')}
            </Button>
          </TailFormItem>
        </Form>
      </React.Fragment>
    )
  }
}

export default withRouter(Form.create()(StickerEditController))