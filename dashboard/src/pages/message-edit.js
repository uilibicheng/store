import React from 'react'
import io from '../io'
import routePath from '../config/route-path'
import {FormItem, TailFormItem} from '../components/base-form'
import {_} from 'i18n-utils'
import {CLOUD_FUNCTION_NAME, MESSAGE_TEMPLATE_ID} from '../config/constants'
import RouterBreadcrumb from '../components/router-breadcrumb'

import {Input, Form, message, Button, Radio, Select} from 'antd'

const RadioGroup = Radio.Group
const Option = Select.Option
let HOURS = []
let MINUTES = []

for (let i = 0; i< 24; i++) {
  HOURS.push(i)
}

for (let i = 0; i< 60; i++) {
  MINUTES.push(i)
}

class MessageEditController extends React.PureComponent {
  state = {
    title: '',
    english_title: '',
    type: '',
    timing_hours: '',
    timing_minutes: '',
    content: '',
    loading: true,
  }

  get id() {
    const {match} = this.props
    const id = match.params.id
    return id && id.trim() ? id.trim() : null
  }

  componentDidMount() {
    if (this.id) {
      this.getMessageDetail(this.id)
    } else {
      this.setState({
        loading: false,
      })
    }
  }

  getMessageDetail(id) {
    io.getMessageRecord(id)
      .then(res => {
        const data = res.data
        this.setState({
          ...data,
          loading: false
        })
      })
      .catch(err => {
        this.setState({
          loading: false,
        })
        throw new Error(err)
      })
  }

  handleTypeChange = e => {
    this.setState({
      type: e.target.value,
    })
  }

  handleHourChange = e => {
    this.setState({
      timing_hours: Number(e.key)
    })
  }

  handleMinuteChange = e => {
    this.setState({
      timing_minutes: Number(e.key)
    })
  }

  handleClickCancel = () => {
    this.props.history.goBack()
  }

  submitQuestion = () => {
    let {timing_hours, timing_minutes, type} = this.state
    this.props.form.validateFields((err, vals) => {
      if (!err) {
        let data = {...vals,}

        if (vals.type === 'timing') {
          if (
            timing_hours < 0 ||
            timing_hours > 23 ||
            timing_minutes < 0 ||
            timing_minutes > 59 ||
            isNaN(timing_hours) ||
            isNaN(timing_minutes)
          ) {
            message.error(_('请输入正确的时间'))
            return
          }
          data.timing_hours = timing_hours
          data.timing_minutes = timing_minutes
          data.status = 'unsent'
        } else {
          data.timing_hours = 0
          data.timing_minutes = 0
          data.status = 'sending'
        }

        const req = this.id ? io.updateMessage(this.id, data) : io.createMessageRecord(data)
        const statusCode = this.id ? 200 : 201
        req.then(res => {
          if (res.status === statusCode) {
            if (type === 'immediate') {
              io.invokeCloudFunction(CLOUD_FUNCTION_NAME.SEND_MESSAGE, {messageId: res.data.id, templateId: MESSAGE_TEMPLATE_ID}, false)
                .then(res => {
                  if (res.status === 200) {
                    message.success(_('已执行发送消息操作'))
                    this.props.history.push({pathname: routePath.messageList})
                  }
                })
                .catch(err => {
                  message.error(_('发送失败'))
                  this.props.history.push({pathname: routePath.messageList})
                })
            } else {
              message.success(_('保存成功'))
              this.props.history.push({pathname: routePath.messageList})
            }
          }
        })
        .catch(err => {
          message.error(_('保存失败'))
          throw new Error(err)
        })
      }
    })
  }

  render() {
    const {loading, english_title, title, content, type, timing_hours, timing_minutes} = this.state
    const {getFieldDecorator} = this.props.form
    const text = this.id ? '编辑消息' : '新增消息'
    const breadcrumbList = [['', _('消息管理')], [routePath.messageList, _('活动消息发布')], ['', _(text)]]

    return loading ? null : (
      <React.Fragment>
        <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 8}} />
        <Form>
          <FormItem label={_('中文标题')}>
            {getFieldDecorator('title', {
              initialValue: title,
              rules: [
                {
                  required: true,
                  message: _('请输入中文标题')
                },
              ],
            })(<Input type='text' style={{width: 400}} />)}
          </FormItem>
          <FormItem label={_('英文标题')}>
            {getFieldDecorator('english_title', {
              initialValue: english_title,
              rules: [
                {
                  required: true,
                  message: _('请输入英文标题'),
                },
              ],
            })(<Input type='text' style={{width: 400}} />)}
          </FormItem>
          <FormItem label={_('发送类型')}>
            {getFieldDecorator('type', {
              initialValue: type,
              rules: [
                {
                  required: true,
                  message: _('请选择发送类型')
                },
              ],
            })(
              <RadioGroup onChange={this.handleTypeChange}>
                <Radio value='immediate'>{_('即时发送')}</Radio>
                <Radio value='timing'>{_('定时发送')}</Radio>
              </RadioGroup>
            )}
          </FormItem>
          {type === 'timing' && (
            <FormItem label={_('每天')}>
              <div>
                <Select
                  labelInValue
                  defaultValue={{key: timing_hours}}
                  style={{width: 100}}
                  onChange={this.handleHourChange}
                >
                  {HOURS.map(v => {
                    return (
                      <Option value={v} key={v}>
                        {v}
                      </Option>
                    )
                  })}
                </Select>{' '}
                : {' '}
                <Select
                  labelInValue
                  defaultValue={{key: timing_minutes}}
                  style={{width: 100}}
                  onChange={this.handleMinuteChange}
                >
                  {MINUTES.map(v => {
                    return (
                      <Option value={v} key={v}>
                        {v}
                      </Option>
                    )
                  })}
                </Select>
              </div>
            </FormItem>
          )}
          <FormItem label={_('内容')}>
            {getFieldDecorator('content', {
              initialValue: content,
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: _('请输入内容'),
                },
              ],
            })(<textarea placeholder={_('请输入内容')} style={styl.textarea} />)}
          </FormItem>
          <TailFormItem>
            <Button style={styl.formBtn} type='default' onClick={this.handleClickCancel}>
              {_('取消')}
            </Button>
            <Button style={styl.formBtn} type='primary' onClick={this.submitQuestion}>
              {type === 'timing' ? _('保存') : _('立即发送')}
            </Button>
          </TailFormItem>
        </Form>
      </React.Fragment>
    )
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px'},
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
    marginLeft: 250,
    marginBottom: 30,
    color: '#999',
    fontSize: '12px',
  },
  productImg: {
    height: 200,
  },
  formBtn: {
    width: 100,
    marginRight: 50,
  },
  textarea: {
    listStyle: 'none',
    position: 'relative',
    display: 'inline-block',
    width: '500px',
    height: '150px',
    lineHeight: '24px',
    fontSize: '14px',
    padding: '4px 11px',
    color: 'rgba(0, 0, 0, 0.65)',
    backgroundColor: '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    resize: 'none',
  },
}

export default Form.create()(MessageEditController)