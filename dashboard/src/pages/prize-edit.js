import React from 'react'
import routePath from '../config/route-path'
import {FILE_GROUP_ID, LANG} from '../config/constants'
import {NavLink, withRouter} from 'react-router-dom'
import io from '../io'
import {_} from 'i18n-utils'

import {FormItem, TailFormItem} from '../components/base-form'
import UploaderFormItem from '../components/formitem-uploader'
import RouterBreadcrumb from '../components/router-breadcrumb'

import {Input, InputNumber, Form, Radio, message, Button} from 'antd'

const RadioGroup = Radio.Group

const styl = {
  breadcrumb: {marginBottom: '20px'},
  purchaseLimit: {display: 'flex', marginTop: 10},
  purchaseInput: {width: 100, marginLeft: 10, marginRight: 10},
  uploadBtn: {
    width: 134,
    height: 134,
    display: 'flex',
    justifyContent: 'center',
  },
  uploadIcon: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  uploadTip: {
    marginLeft: 140,
    marginBottom: 30,
    color: '#999',
    fontSize: '12px',
  },
  productImg: {
    width: 300,
  },
  formBtn: {
    width: 100,
    marginRight: 50,
  },
}

class PrizeEditController extends React.PureComponent {
  componentDidMount() {
    this.getPrizeDetail()
    this.getIsPromotionalBundle()
    const currentLang = window.LANG
    this.setState({
      currentLang,
    })
  }

  state = {
    name: '',
    english_name: '',
    cover: null,
    description: '',
    limitStatus: false,
    loading: true,
    discount: 0,
    banner: [],
    hasPromotionalBundle: false,
    initPromotionalBundle: false,
    currentLang: '',
  }

  get id() {
    const {match} = this.props
    const id = match.params.id
    return id && id.trim() ? id.trim() : null
  }

  getPrizeDetail = () => {
    if (this.id) {
      io.getPrizeDetail(this.id).then(({data}) => {
        this.setState({
          limitStatus: !!Object.keys(data.redeem_limitation).length,
          limitNumber: data.redeem_limitation.count || '',
          limitTime: data.redeem_limitation.day || '',
          initPromotionalBundle: data.type === 'promotional_bundle',
        })
        this.setState({
          ...data,
          loading: false,
        })
      })
    } else {
      this.setState({loading: false})
    }
  }

  getIsPromotionalBundle() {
    io.getIsPromotionalBundle({
      where: {
        type: {
          $eq: 'promotional_bundle',
        },
      },
    }).then(res => {
      this.setState({
        hasPromotionalBundle: res.data.meta.total_count > 0,
      })
    })
  }

  getReqData = values => {
    const {limitStatus, limitNumber, limitTime, type} = this.state
    const data = {...values}
    const {cover, images} = data
    if (cover && cover.length) {
      data.cover = cover.map(i => i.url || i)[0]
    }
    if (images && images.length) {
      data.images = images.map(i => i.url || i)
    }
    data.total_count = Number(data.total_count)
    data.priority = Number(data.priority)
    data.redeem_limitation = limitStatus
      ? {
        count: limitNumber,
        day: limitTime,
      }
      : {}
    return data
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {history} = this.props
        const req = this.id ? this.updatePrizeRecord(values) : this.createPrizeRecord(values)
        req
          .then(() => {
            history.push(routePath.prizeList)
          })
          .catch(e => {
            message.error(e.toString())
          })
      }
    })
  }

  createPrizeRecord = values => {
    return io.createPrizeRecord(this.getReqData(values))
  }

  updatePrizeRecord = values => {
    return io.updatePrizeRecord(this.id, this.getReqData(values))
  }

  handlePrizeTypeChange = e => {
    this.setState({
      type: e.target.value,
    })
  }

  handleLimitTime = value => {
    console.log(1111,value)
    this.setState({
      limitTime: Number(value),
    })
  }

  handleLimitNumber = value => {
    this.setState({
      limitNumber: Number(value),
    })
  }

  render() {
    const text = this.id ? _('编辑奖品') : _('新增奖品')
    const breadcrumbList = [['', _('奖品管理')], [routePath.prizeList, _('奖品列表')], ['', _(text)]]
    const {getFieldDecorator} = this.props.form
    const {
      name,
      english_name,
      cover,
      type,
      loading,
      images,
      total_count,
      initPromotionalBundle,
      hasPromotionalBundle,
      limitStatus,
      limitTime,
      limitNumber,
      currentLang,
      priority,
    } = this.state
    const pixel = type === 'area_limit' ? ' 295 * 221' : ' 200 * 200'
    return loading ? null : (
      <React.Fragment>
        <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 20}} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem label={_('奖品类型')}>
            {getFieldDecorator('type', {
              initialValue: type,
              rules: [
                {
                  required: true,
                  message: _('请选择奖品类型'),
                },
              ],
            })(
              <RadioGroup onChange={this.handlePrizeTypeChange}>
                <Radio value='normal'>{_('普通奖品')}</Radio>
                <Radio disabled={!initPromotionalBundle && hasPromotionalBundle} value='promotional_bundle'>
                  {_('新人优惠大礼')}
                </Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem label={type === 'tips' ? _('温馨提示') : _('奖品名称')}>
            {getFieldDecorator('name', {
              initialValue: name,
              rules: [
                {
                  required: true,
                  message: type === 'tips' ? _('请输入温馨提示') : _('请输入奖品名称'),
                },
              ],
            })(<Input style={{width: '50%'}} />)}
          </FormItem>
          <FormItem label={type === 'tips' ? _('温馨提示（英文）') : _('英文名称')}>
            {getFieldDecorator('english_name', {
              initialValue: english_name,
              rules: [
                {
                  required: true,
                  message: type === 'tips' ? _('请输入英文提示') : _('请输入英文名称'),
                },
              ],
            })(<Input style={{width: '50%'}} />)}
          </FormItem>
          <FormItem label={_('优先级')}>
            {getFieldDecorator('priority', {
              initialValue: priority,
              rules: [
                {
                  required: true,
                  message: _('请输入优先级'),
                },
              ],
            })(<Input type='number' style={{width: 120}} />)}
          </FormItem>
          <FormItem label={_('封面图')}>
            {getFieldDecorator('cover', {
              initialValue: cover ? [cover] : [],
              rules: [
                {
                  required: true,
                  message: _('请选择封面图'),
                },
              ],
            })(
              <UploaderFormItem
                categoryId={FILE_GROUP_ID.PRIZE}
                msg={_('支持 PNG，JPG，图片大小不超过 200 K，建议像素为') + pixel}
                name='cover'
                listType='picture-card'
                showUploadList={false}
                beforeUpload={() => false}
              />
            )}
          </FormItem>
          <FormItem label={_('详情页大图')}>
            {getFieldDecorator('images', {
              initialValue: images,
              rules: [
                {
                  required: true,
                  message: _('请选择详情页大图'),
                },
              ],
            })(
              <UploaderFormItem
                categoryId={FILE_GROUP_ID.PRIZE}
                msg={_('支持 PNG，JPG，图片大小不超过 200 K，建议像素为') + ' 375 * 375'}
                name='images'
                limit={Number.POSITIVE_INFINITY}
                listType='picture-card'
                showUploadList={{showPreviewIcon: false, showRemoveIcon: true}}
                beforeUpload={() => false}
              />
            )}
          </FormItem>

          <FormItem label={_('是否限制兑换次数')}>
            <RadioGroup
              onChange={e => {
                this.setState({
                  limitStatus: e.target.value,
                })
              }}
              value={limitStatus}
            >
              <Radio value>{_('是')}</Radio>
              <Radio value={false}>{_('否')}</Radio>
            </RadioGroup>
            {limitStatus && (
              <div>
                {currentLang === LANG.ZH ? (
                  <div style={styl.purchaseLimit}>
                    <span>
                      {_('每个微信')} ID {_('号')}
                    </span>
                    <InputNumber min={1} defaultValue={limitTime} style={styl.purchaseInput} onChange={this.handleLimitTime} />
                    <span>{_('天内可兑换')}</span>
                    <InputNumber
                      style={styl.purchaseInput}
                      min={1}
                      defaultValue={limitNumber}
                      onChange={this.handleLimitNumber}
                    />
                    <span>{_('次')}</span>
                  </div>
                ) : (
                  <div style={styl.purchaseLimit}>
                    <span>Each WeChat ID can redeem</span>
                    <InputNumber
                      min={1}
                      defaultValue={limitNumber}
                      style={styl.purchaseInput}
                      onChange={this.handleLimitNumber}
                    />
                    <span>times in</span>
                    <InputNumber min={1} defaultValue={limitTime} style={styl.purchaseInput} onChange={this.handleLimitTime} />
                    <span>days</span>
                  </div>
                )}
              </div>
            )}
          </FormItem>
          <FormItem label={_('奖品数量')}>
            {getFieldDecorator('total_count', {
              initialValue: total_count,
              rules: [
                {
                  required: true,
                  message: _('请输入奖品数量'),
                },
              ],
            })(
              <Input
                type='number'
                onChange={e => {
                  this.setState({
                    total_count: Number(e.target.value),
                  })
                }}
                style={{width: 120}}
              />
            )}
          </FormItem>
          <TailFormItem>
            <NavLink to={routePath.prizeList}>
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

export default withRouter(Form.create()(PrizeEditController))
