import React from 'react'
import {Form, InputNumber, Button, Switch, Input,  List, Icon, message} from 'antd'
import {_} from 'i18n-utils'
import {FormItem, TailFormItem} from '../components/base-form'
import io from '../io'
import RouterBreadcrumb from '../components/router-breadcrumb'
import {REGEXP_EMAIL} from '../config/constants'

const ListItem = List.Item
const Search = Input.Search

class ExpiredWarning extends React.PureComponent {
  state = {
    enable_expired_warning: false,
    expired_warning_threshold: 0,
    expired_warning_email: [],
    mailInputVal: '',
    id: null,
  }

  componentWillMount() {
    this.getSettings()
  }
  getSettings = () => {
    io.getSettingList({limit: 1}).then(({data}) => {
      const list = data && data.objects
      if (!list || !list.length) return
      const {
        enable_expired_warning = false,
        expired_warning_threshold = 0,
        expired_warning_email = [],
        id = null,
      } = data.objects[0]
      this.setState({
        enable_expired_warning,
        expired_warning_threshold,
        expired_warning_email,
        id,
      })
    })
  }

  onChangeEmailInput = event => {
    this.setState({
      mailInputVal: event.currentTarget.value
    })
  }

  isValidEmail = val => {
    if (typeof val !== 'string') return
    return REGEXP_EMAIL.test(val.trim())
  }

  onAddEmail = (val, event) => {
    event.preventDefault()
    if (!this.isValidEmail(val)) {
      return message.info(_('你输入的似乎不是一个邮箱'))
    }
    const {expired_warning_email} = this.state
    const mails = [...expired_warning_email]
    mails.push(val)
    this.setState({
      expired_warning_email: mails,
      mailInputVal: '',
    })
  }

  onDelEmail = e => {
    const mail = e.currentTarget.dataset.email
    const {expired_warning_email} = this.state
    const mails = [...expired_warning_email]
    mails.splice(mails.indexOf(mail), 1)
    this.setState({expired_warning_email: mails})
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {expired_warning_email} = this.state
        const {expired_warning_threshold, enable_expired_warning} = values
        io.updateSetting(this.state.id, {
          expired_warning_email,
          expired_warning_threshold,
          enable_expired_warning,
        })
        .then(() => message.success(_('保存成功')))
        .catch(e => message.error(e.toString()))
      }
    })
  }

  render() {
    const breadcrumbList = [['', _('设置')], ['', _('过期提醒')]]
    const {getFieldDecorator} = this.props.form
    const {
      enable_expired_warning,
      expired_warning_threshold,
      expired_warning_email,
      mailInputVal,
    } = this.state

    return (
      <React.Fragment>
        <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 8}} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem label={_('启用门票过期提醒功能')}>
            {getFieldDecorator('enable_expired_warning', {
              initialValue: enable_expired_warning,
              valuePropName: 'checked',
            })(<Switch />)}
          </FormItem>
          <FormItem label={_('设置门票剩余有效天数')}>
            {getFieldDecorator('expired_warning_threshold', {
              initialValue: expired_warning_threshold,
              rules: [
                {
                  required: true,
                  message: _('请填写门票剩余有效天数')
                }
              ],
            })(<InputNumber precision={0} style={{width: '50%'}} />)}
          </FormItem>
          <FormItem label={_('门票过期提示邮箱')}>
            <Search 
              value={mailInputVal}
              onChange={this.onChangeEmailInput}
              style={{width: '50%', margin: 0}}
              onSearch={this.onAddEmail}
              enterButton={<Icon type='plus' />}
            />
          </FormItem>
          {!!expired_warning_email.length && (
            <TailFormItem>
              <List
                dataSource={expired_warning_email}
                header={_('推送邮箱')}
                size='small'
                bordered
                renderItem={item => (
                  <ListItem
                    actions={[
                      <Button data-email={item} onClick={this.onDelEmail}>
                        {_('删除')}
                      </Button>,
                    ]}
                  >
                    {item}
                  </ListItem>
                )}
              />
            </TailFormItem>
          )}
          <TailFormItem>
            <Button type='primary' htmlType='submit'>
              {_('保存')}
            </Button>
          </TailFormItem>
        </Form>
      </React.Fragment>
    )
  }
}

export default Form.create()(ExpiredWarning)