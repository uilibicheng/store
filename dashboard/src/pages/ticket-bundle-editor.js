import React from 'react'
import {NavLink, withRouter} from 'react-router-dom'
import {Button, Form, Input, message, Radio, Select} from 'antd'
import io from '../io'
import {_} from 'i18n-utils'

import {FILE_GROUP_ID} from '../config/constants'
import routePath from '../config/route-path'

import {FormItem, TailFormItem} from '../components/base-form'
import UeditorFormItem from '../components/formitem-ueditor'
import UploaderFormItem from '../components/formitem-uploader'
import RouteBreadcrumb from '../components/router-breadcrumb'

const RadioGroup = Radio.Group
const Option = Select.Option

const SPECIAL_TICKET_TYPE = {
  SHARE_DISCOUNT: 'share_discount',
  PRIZE_DISCOUNT: 'prize_discount',
  PRIZE_BUY_ONE_GET_ONE_FREE: 'prize_buy_one_get_one_free',
  COMPLIMENTARY: 'complimentary',
}

class TicketBundleEditor extends React.PureComponent {
  componentDidMount() {
    this.getTicketBundle()
    this.getTicketBundleList()
  }

  state = {
    name: '',
    english_name: '',
    cover: null,
    description: '',
    ticket_policy: '',
    loading: true,
    discount: 0,
    is_discount: false,
    showSpecialTicketType: false,
    showRelatedTicketBundle: false,
    showCover: true,
    showCoverInList: true,
    showDetailBackground: true,
    showOrderListCover: true,
    showDescription: true,
    showTicketPolicy: true,
    priority: 1,
    special_ticket_type: SPECIAL_TICKET_TYPE.SHARE_DISCOUNT,
    related_ticket_bundle: '',
    complimentaryTickets: [],
  }

  get id() {
    const {match} = this.props
    const id = match.params.id
    return id && id.trim() ? id.trim() : null
  }

  getTicketBundle = () => {
    if (this.id) {
      io.getTicketBundle(this.id).then(({data}) => {
        this.setState({
          ...data,
          showSpecialTicketType: data.is_discount,
          showRelatedTicketBundle: data.special_ticket_type === SPECIAL_TICKET_TYPE.PRIZE_BUY_ONE_GET_ONE_FREE,
          showCover: !data.is_discount ||
            data.special_ticket_type === SPECIAL_TICKET_TYPE.SHARE_DISCOUNT ||
            !data.special_ticket_type,
          showCoverInList: !data.is_discount,
          showDetailBackground: data.special_ticket_type !== SPECIAL_TICKET_TYPE.COMPLIMENTARY,
          showOrderListCover: data.special_ticket_type !== SPECIAL_TICKET_TYPE.COMPLIMENTARY,
          showDescription: data.special_ticket_type !== SPECIAL_TICKET_TYPE.COMPLIMENTARY,
          showTicketPolicy: data.special_ticket_type !== SPECIAL_TICKET_TYPE.COMPLIMENTARY,
          loading: false,
        })
      })
    } else {
      this.setState({loading: false})
    }
  }

  getTicketBundleList() {
    io.getTicketBundleList()
      .then(res => {
        let complimentaryTickets = []
        res.data.objects.forEach(item => {
          if (item.special_ticket_type === SPECIAL_TICKET_TYPE.COMPLIMENTARY) complimentaryTickets.push(item)
        })
        this.setState({
          complimentaryTickets,
        })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  getReqData = values => {
    const data = {...values}
    const {cover, cover_in_list, cover_in_details, cover_order_list} = data
    if (cover && cover.length) {
      data.cover = cover.map(i => i.url || i)[0]
    }
    if (cover_in_list && cover_in_list.length) {
      data.cover_in_list = cover_in_list.map(i => i.url || i)[0]
    } else {
      data.cover_in_list = ''
    }
    if (cover_in_details && cover_in_details.length) {
      data.cover_in_details = cover_in_details.map(i => i.url || i)[0]
    }
    if (cover_order_list && cover_order_list.length) {
      data.cover_order_list = cover_order_list.map(i => i.url || i)[0]
    }
    data.priority = Number(data.priority)
    return data
  }

  handleIsDiscountChange = e => {
    const val = e.target.value
    this.setState({
      showSpecialTicketType: val,
      showRelatedTicketBundle: false,
      showCover: true,
      showCoverInList: !val,
      showDetailBackground: true,
      showOrderListCover: true,
      showDescription: true,
      showTicketPolicy: true,
      special_ticket_type: SPECIAL_TICKET_TYPE.SHARE_DISCOUNT,
      related_ticket_bundle: '',
    })
  }

  handleIsSpecialTypeChange = e => {
    const val = e.target.value
    this.setState({
      showRelatedTicketBundle: val === SPECIAL_TICKET_TYPE.PRIZE_BUY_ONE_GET_ONE_FREE,
      showCover: val === SPECIAL_TICKET_TYPE.SHARE_DISCOUNT,
      showDetailBackground: val !== SPECIAL_TICKET_TYPE.COMPLIMENTARY,
      showOrderListCover: val !== SPECIAL_TICKET_TYPE.COMPLIMENTARY,
      showDescription: val !== SPECIAL_TICKET_TYPE.COMPLIMENTARY,
      showTicketPolicy: val !== SPECIAL_TICKET_TYPE.COMPLIMENTARY,
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {history} = this.props
        const req = this.id ? this.updateTicketBundle(values) : this.createTicketBundle(values)
        req
          .then(() => {
            history.push(routePath.ticketBundleList)
          })
          .catch(e => message.error(e.toString()))
      }
    })
  }

  createTicketBundle = values => {
    return io.createTicketBundle(this.getReqData(values))
  }

  updateTicketBundle = values => {
    return io.updateTicketBundle(this.id, this.getReqData(values))
  }

  render() {
    const {getFieldDecorator} = this.props.form
    const {
      name,
      cover,
      description,
      ticket_policy,
      loading,
      english_name,
      cover_in_list,
      cover_in_details,
      cover_order_list,
      is_discount,
      showCoverInList,
      priority,
      accesso_product_id,
      showSpecialTicketType,
      showRelatedTicketBundle,
      showCover,
      showDetailBackground,
      showOrderListCover,
      showDescription,
      showTicketPolicy,
      special_ticket_type,
      related_ticket_bundle,
      complimentaryTickets,
    } = this.state
    const breadcrumbList = [
      [routePath.ticketBundleList, _('产品管理')],
      [routePath.ticketBundleList, _('门票管理')],
      ['', this.id ? _('编辑门票') : _('新增门票')],
    ]
    return loading ? null : (
      <React.Fragment>
        <RouteBreadcrumb data={breadcrumbList} style={{marginBottom: 20}} />
        <Form onSubmit={this.handleSubmit} className='ticket-bundle-editor'>
          <FormItem label={_('门票名称')}>
            {getFieldDecorator('name', {
              initialValue: name,
              rules: [
                {
                  required: true,
                  message: _('请输入门票名称'),
                },
              ],
            })(<Input style={{width: '50%'}} />)}
          </FormItem>
          <FormItem label={_('英文名称')}>
            {getFieldDecorator('english_name', {
              initialValue: english_name,
              rules: [
                {
                  required: true,
                  message: _('请输入门票英文名称'),
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
            })(<Input style={{width: '50%'}} />)}
          </FormItem>
          <FormItem label={_('Accesso Product ID')}>
            {getFieldDecorator('accesso_product_id', {
              initialValue: accesso_product_id,
              rules: [
                {
                  required: true,
                  message: _('请输入 Accesso Product ID'),
                },
              ],
            })(<Input style={{width: '50%'}} />)}
          </FormItem>
          <FormItem label={_('门票类型')}>
            {getFieldDecorator('is_discount', {
              initialValue: is_discount,
              rules: [
                {
                  required: true,
                  message: _('请选择门票类型'),
                },
              ],
            })(
              <RadioGroup onChange={this.handleIsDiscountChange}>
                <Radio value={false}>{_('普通门票')}</Radio>
                <Radio value>{_('特殊门票')}</Radio>
              </RadioGroup>
            )}
          </FormItem>
          {showSpecialTicketType && <FormItem label={_('特殊门票类型')}>
            {getFieldDecorator('special_ticket_type', {
              initialValue: special_ticket_type,
              rules: [
                {
                  required: true,
                  message: _('请选择特殊门票类型'),
                },
              ],
            })(
              <RadioGroup onChange={this.handleIsSpecialTypeChange}>
                <Radio value={SPECIAL_TICKET_TYPE.SHARE_DISCOUNT}>{_('分享-折扣票')}</Radio>
                <Radio value={SPECIAL_TICKET_TYPE.PRIZE_DISCOUNT}>{_('活动-折扣票')}</Radio>
                <Radio value={SPECIAL_TICKET_TYPE.PRIZE_BUY_ONE_GET_ONE_FREE}>{_('活动-买一送一票')}</Radio>
                <Radio value={SPECIAL_TICKET_TYPE.COMPLIMENTARY}>{_('活动-赠送票')}</Radio>
              </RadioGroup>
            )}
          </FormItem>
          }
          {showRelatedTicketBundle && <FormItem label={_('绑定赠送票')}>
            {getFieldDecorator('related_ticket_bundle', {
              initialValue: related_ticket_bundle,
              rules: [
                {
                  required: true,
                  message: _('请选择赠送票'),
                },
              ],
            })(
              <Select style={{width: 490}} onChange={this.handleChange}>
                {complimentaryTickets.map((item, index) => {
                  return (
                    <Option value={item.id} key={index}>
                      {item.name}
                    </Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
          }
          {showCover && <FormItem label={_('封面图')}>
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
                categoryId={FILE_GROUP_ID.TICKET_BUNDLE}
                msg={_('支持 PNG，JPG，图片大小不超过 200 K，建议像素为') + ' 200 * 266'}
                name='cover'
                listType='picture-card'
                showUploadList={false}
                beforeUpload={() => false}
              />
            )}
          </FormItem>
          }
          {showCoverInList && (
            <FormItem label={_('列表封面图')}>
              {getFieldDecorator('cover_in_list', {
                initialValue: cover_in_list ? [cover_in_list] : [],
                rules: [
                  {
                    required: true,
                    message: _('请选择列表图'),
                  },
                ],
              })(
                <UploaderFormItem
                  categoryId={FILE_GROUP_ID.TICKET_BUNDLE}
                  msg={_('支持 PNG，JPG，图片大小不超过 200 K，建议像素为') + '345 * 120'}
                  name='cover'
                  listType='picture-card'
                  showUploadList={false}
                  beforeUpload={() => false}
                />
              )}
            </FormItem>
          )}
          {showDetailBackground && <FormItem label={_('详情页背景颜色图')}>
            {getFieldDecorator('cover_in_details', {
              initialValue: cover_in_details ? [cover_in_details] : [],
              rules: [
                {
                  required: true,
                  message: _('请选择详情页背景颜色图'),
                },
              ],
            })(
              <UploaderFormItem
                categoryId={FILE_GROUP_ID.TICKET_BUNDLE}
                msg={_('支持 PNG，JPG，图片大小不超过 200 K，建议像素为') + '375 * 375'}
                name='cover'
                listType='picture-card'
                showUploadList={false}
                beforeUpload={() => false}
              />
            )}
          </FormItem>
          }
          {showOrderListCover && <FormItem label={_('订单列表门票图')}>
            {getFieldDecorator('cover_order_list', {
              initialValue: cover_order_list ? [cover_order_list] : [],
              rules: [
                {
                  required: true,
                  message: _('请选择订单列表门票图'),
                },
              ],
            })(
              <UploaderFormItem
                categoryId={FILE_GROUP_ID.TICKET_BUNDLE}
                msg={_('支持 PNG，JPG，图片大小不超过 200 K，建议像素为') + '375 * 375'}
                name='cover'
                listType='picture-card'
                showUploadList={false}
                beforeUpload={() => false}
              />
            )}
          </FormItem>
          }
          {showDescription && <FormItem label={_('门票说明')}>
            {getFieldDecorator('description', {
              initialValue: description,
            })(<UeditorFormItem />)}
          </FormItem>
          }
          {showTicketPolicy && <FormItem label={_('购买须知')}>
            {getFieldDecorator('ticket_policy', {
              initialValue: ticket_policy,
            })(<UeditorFormItem />)}
          </FormItem>
          }

          <TailFormItem>
            <NavLink to={routePath.ticketBundleList}>
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

export default withRouter(Form.create()(TicketBundleEditor))
