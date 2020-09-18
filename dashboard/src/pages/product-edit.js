import React from 'react'
import BaseIO from '../io'
import routePath from '../config/route-path'
import {FILE_GROUP_ID, LANG} from '../config/constants'
import {CURRENCY} from '../config/enums'
import UploaderFormItem from '../components/formitem-uploader'
import RouteBreadcrumb from '../components/router-breadcrumb'
import {FormItem, TailFormItem} from '../components/base-form'
import {_} from 'i18n-utils'

import {Input, Select, Form, Radio, message, Button} from 'antd'

const Option = Select.Option
const RadioGroup = Radio.Group

const SPECIAL_TICKET_TYPE = {
  SHARE_DISCOUNT: 'share_discount',
  PRIZE_DISCOUNT: 'prize_discount',
  PRIZE_BUY_ONE_GET_ONE_FREE: 'prize_buy_one_get_one_free',
  COMPLIMENTARY: 'complimentary',
}

class ProductEditController extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      productList: [],
      id: null,
      purchaseLimit: {}, // 购买限制条件
      limitStatus: false, // 是否设置购买限制
      limitTime: '',
      limitNumber: '',
      isDiscount: false, // 是否促销门票
      discountPrice: '',
      name: '', // 产品名称
      bundleName: '', // 门票名称
      englishBundleName: '', // 门票英文名称
      bundle: '', // 套票
      type: '', // 票种
      price: '', // 票价
      productDetail: {},
      ticketBundleList: [],
      loading: true,
      imageUrl: '', // 产品图片
      ticketTypeList: [],
      currentLang: '',
      showPurchaseLimit: true,
      showIsDiscount: true,
      showImageUrl: true,
    }
  }

  componentDidMount() {
    const {match} = this.props
    const id = match.params.id
    const currentLang = window.LANG
    this.getTicketBundleList()
    this.getTicketTypeList()
    this.setState({
      id: id || null,
      currentLang,
    })
    if (id) {
      this.getProductDetail(id)
    } else {
      this.setState({
        loading: false,
      })
    }
  }

  getTicketTypeList() {
    BaseIO.getTicketTypeList().then(res => {
      this.setState({
        ticketTypeList: res.data.objects,
      })
    })
  }

  getTicketBundleList() {
    BaseIO.getTicketBundleList()
      .then(res => {
        this.setState({
          ticketBundleList: res.data.objects,
        })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  getProductDetail(id) {
    BaseIO.getProductDetailById(id)
      .then(res => {
        const data = res.data
        this.setState({
          productDetail: data,
          imageUrl: data.cover || '',
          name: data.name,
          type: data.type.id,
          price: data.price || '',
          bundle: data.bundle.id,
          bundleName: data.bundle.name,
          englishBundleName: data.bundle.english_name,
          isDiscount: !!data.is_discount,
          discountPrice: data.discount_price || '',
          limitStatus: !!data.purchase_limitation && !!Object.keys(data.purchase_limitation).length,
          limitNumber: (data.purchase_limitation && data.purchase_limitation.count) || '',
          limitTime: (data.purchase_limitation && data.purchase_limitation.day) || '',
          showPurchaseLimit: data.bundle.special_ticket_type !== SPECIAL_TICKET_TYPE.COMPLIMENTARY,
          showIsDiscount: (data.bundle.special_ticket_type !== SPECIAL_TICKET_TYPE.COMPLIMENTARY) &&
            (data.bundle.special_ticket_type !== SPECIAL_TICKET_TYPE.PRIZE_BUY_ONE_GET_ONE_FREE),
          showImageUrl: data.bundle.special_ticket_type !== SPECIAL_TICKET_TYPE.COMPLIMENTARY,
          loading: false,
        })
      })
      .catch(err => {
        this.setState({
          loading: false,
        })
        throw new Error(err)
      })
  }
  // 票种改变
  handleChange = value => {
    this.setState({
      type: value,
    })
  }
  // 是否限购改变
  handlePurchaseLimitChange = e => {
    this.setState({
      limitStatus: e.target.value,
    })
  }
  // 是否折扣优惠类门票改变
  handleDiscountChange = e => {
    this.setState({
      isDiscount: e.target.value,
    })
  }
  // 门票名称改变
  handleSelectName = value => {
    this.state.ticketBundleList.forEach(item => {
      if (item.id === value) {
        let data = {
          bundle: value,
          bundleName: item.name,
          englishBundleName: item.english_name,
          showPurchaseLimit: true,
          showIsDiscount: true,
          showImageUrl: true,
        }
        if (item.special_ticket_type === SPECIAL_TICKET_TYPE.COMPLIMENTARY) {
          data.showPurchaseLimit = false
          data.showIsDiscount = false
          data.showImageUrl = false
        }
        if (item.special_ticket_type === SPECIAL_TICKET_TYPE.PRIZE_BUY_ONE_GET_ONE_FREE) {
          data.showIsDiscount = false
        }
        this.setState(data)
      }
    })
  }

  submitProduct = () => {
    const {
      limitNumber,
      limitTime,
      limitStatus,
      bundle,
      bundleName,
      englishBundleName,
      discountPrice,
      id,
      price,
      ticketTypeList,
      showPurchaseLimit,
      showIsDiscount,
      showImageUrl,
    } = this.state

    this.props.form.validateFields((err, vals) => {
      if (showPurchaseLimit && limitStatus && (limitNumber <= 0 || limitTime <= 0)) {
        return message.error(_('请输入正确的限制条件'))
      }
      let typeName = ''
      let englishTypeName = ''
      ticketTypeList.forEach(item => {
        if (item.id === vals.type) {
          typeName = item.name
          englishTypeName = item.english_name
        }
      })
      if (!err) {
        let data = {
          type: vals.type,
          bundle,
          price,
          name: `${bundleName}-${typeName}`,
          english_name: `${englishBundleName}-${englishTypeName}`,
          sku: `${bundle}-${vals.type.toLowerCase()}`,
          is_discount: showIsDiscount ? vals.isDiscount : false,
          discount_price: (showIsDiscount && vals.isDiscount) ? discountPrice : null,
          cover: showImageUrl ? vals.imageUrl[0].url : '',
          purchase_limitation: (showPurchaseLimit && limitStatus)
            ? {
              count: limitNumber,
              day: limitTime,
            }
            : {},
        }

        const req = id ? BaseIO.updateProductRecord(id, data) : BaseIO.createProductRecord(data)
        const statusCode = id ? 200 : 201
        req
          .then(res => {
            if (res.status === statusCode) {
              message.success(_('保存成功！'))
              this.props.history.push({pathname: routePath.productList})
            }
          })
          .catch(err => {
            if (err.response.data.error_msg === '当前字段存在唯一索引，无法创建重复数据') {
              message.error(_('该产品已存在，请前往门票管理新增门票'))
            } else {
              message.error(_('保存失败'))
              throw new Error(err)
            }
          })
      }
    })
  }

  handleClickCancel = () => {
    this.props.history.goBack()
  }
  // 限购时间改变
  handleLimitTime = e => {
    this.setState({
      limitTime: Number(e.target.value),
    })
  }
  // 限购份数改变
  handleLimitNumber = e => {
    this.setState({
      limitNumber: Number(e.target.value),
    })
  }

  render() {
    const {
      id,
      ticketBundleList,
      limitStatus,
      price,
      discountPrice,
      bundleName,
      type,
      isDiscount,
      loading,
      imageUrl,
      limitNumber,
      limitTime,
      ticketTypeList,
      currentLang,
      showPurchaseLimit,
      showIsDiscount,
      showImageUrl,
    } = this.state
    const {getFieldDecorator} = this.props.form
    const breadcrumbList = [
      ['', _('产品管理')],
      [routePath.productList, _('产品列表')],
      ['', id ? _('编辑产品') : _('新增产品')],
    ]

    return loading ? null : (
      <React.Fragment>
        <RouteBreadcrumb data={breadcrumbList} style={{marginBottom: 20}} />
        <Form>
          <FormItem label={_('门票名称')}>
            {getFieldDecorator('bundleName', {
              initialValue: bundleName,
              rules: [
                {
                  required: true,
                  message: _('请选择门票名称'),
                },
              ],
            })(
              <Select style={{width: 300}} onChange={this.handleSelectName}>
                {ticketBundleList.map((item, index) => {
                  return (
                    <Option value={item.id} key={index}>
                      {item.name}
                    </Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
          <FormItem label={_('票种')}>
            {getFieldDecorator('type', {
              initialValue: type,
              rules: [
                {
                  required: true,
                  message: _('请选择票种'),
                },
              ],
            })(
              <Select style={{width: 120}} onChange={this.handleChange}>
                {ticketTypeList.map((item, index) => {
                  return (
                    <Option value={item.id} key={index}>
                      {item.name}
                    </Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
          <FormItem label={_('票价') + `(${CURRENCY.JPY})`}>
            {getFieldDecorator('price', {
              initialValue: price,
              rules: [
                {
                  required: true,
                  message: _('请输入票价'),
                },
              ],
            })(
              <Input
                type='number'
                style={{width: 120}}
                onChange={e => {
                  const value = Number(e.target.value)
                  this.setState({price: Number(value.toFixed(2))})
                }}
              />
            )}
            {price > 0 && (
              <span style={{marginLeft: 20}}>
                {_('约 {sum} 人民币', {sum: ((price * 100 * 61) / 100000).toFixed(2)})}
              </span>
            )}
          </FormItem>
          {showPurchaseLimit && <FormItem label={_('是否限购')}>
            <RadioGroup onChange={this.handlePurchaseLimitChange} value={limitStatus}>
              <Radio value>{_('是')}</Radio>
              <Radio value={false}>{_('否')}</Radio>
            </RadioGroup>
            {limitStatus && showPurchaseLimit && (
              <div>
                {currentLang === LANG.ZH ? (
                  <div style={styl.purchaseLimit}>
                    <span>
                      {_('每个微信')} ID {_('号')}
                    </span>
                    <Input type='number' value={limitTime} style={styl.purchaseInput} onChange={this.handleLimitTime} />
                    <span>{_('天内可购买')}</span>
                    <Input
                      type='number'
                      value={limitNumber}
                      style={styl.purchaseInput}
                      onChange={this.handleLimitNumber}
                    />
                    <span>{_('份')}</span>
                  </div>
                ) : (
                  <div style={styl.purchaseLimit}>
                    <span>Each WeChat ID can purchase</span>
                    <Input
                      type='number'
                      value={limitNumber}
                      style={styl.purchaseInput}
                      onChange={this.handleLimitNumber}
                    />
                    <span>tickets in</span>
                    <Input type='number' value={limitTime} style={styl.purchaseInput} onChange={this.handleLimitTime} />
                    <span>days</span>
                  </div>
                )}
              </div>
            )}
          </FormItem>}
          {showIsDiscount && <FormItem label={_('是否折扣优惠类门票')}>
            {getFieldDecorator('isDiscount', {
              initialValue: isDiscount,
              rules: [
                {
                  required: true,
                  message: _('请选择是否折扣优惠类门票'),
                },
              ],
            })(
              <RadioGroup onChange={this.handleDiscountChange}>
                <Radio value>{_('是')}</Radio>
                <Radio value={false}>{_('否')}</Radio>
              </RadioGroup>
            )}
          </FormItem>}
          {isDiscount && showIsDiscount && (
            <FormItem label={_('折扣优惠价格')}>
              {getFieldDecorator('discount_price', {
                initialValue: discountPrice,
                rules: [
                  {
                    required: true,
                    message: _('请输入折扣价格'),
                  },
                ],
              })(
                <Input
                  type='number'
                  onChange={e => {
                    this.setState({
                      discountPrice: Number(e.target.value),
                    })
                  }}
                  style={{width: 120}}
                />
              )}
              {Number(discountPrice) > 0 && (
                <span style={{marginLeft: 20}}>
                  {_('约 {sum} 人民币', {sum: ((discountPrice * 100 * 61) / 100000).toFixed(2)})}
                </span>
              )}
            </FormItem>
          )}
          {showImageUrl && <FormItem label={_('产品图片')}>
            {getFieldDecorator('imageUrl', {
              initialValue: imageUrl ? [imageUrl] : [],
              rules: [
                {
                  required: true,
                  message: _('请上传产品图片'),
                },
              ],
            })(
              <UploaderFormItem
                categoryId={FILE_GROUP_ID.PRODUCT}
                msg={_('支持 PNG，JPG，图片大小不超过 200 K，建议像素为') + ' 152 * 201'}
                name='cover'
                listType='picture-card'
                showUploadList={false}
                beforeUpload={() => false}
              />
            )}
          </FormItem>}
          <TailFormItem>
            <Button style={styl.formBtn} type='default' onClick={this.handleClickCancel}>
              {_('取消')}
            </Button>
            <Button style={styl.formBtn} type='primary' onClick={this.submitProduct}>
              {_('保存')}
            </Button>
          </TailFormItem>
        </Form>
      </React.Fragment>
    )
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px'},
  purchaseLimit: {display: 'flex', marginTop: 10},
  purchaseInput: {width: 100, marginLeft: 10, marginRight: 10},
  uploadBtn: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 0,
  },
  uploadTip: {
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

export default Form.create()(ProductEditController)
