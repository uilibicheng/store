import React from 'react'
import {Form, InputNumber, Button, Switch, Input, List, Icon, message} from 'antd'
import {_} from 'i18n-utils'
import {FormItem, TailFormItem} from '../components/base-form'
import io from '../io'
import RouterBreadcrumb from '../components/router-breadcrumb'
import {REGEXP_EMAIL} from '../config/constants'

const ListItem = List.Item
const Search = Input.Search

class InventoryWarning extends React.PureComponent {
  state = {
    enable_inventory_warning: false,
    inventory_warning_threshold: 0,
    inventory_warning_email: [],
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
        enable_inventory_warning = false,
        inventory_warning_threshold = 0,
        inventory_warning_email = [],
        id,
      } = data.objects[0]
      this.setState({
        enable_inventory_warning,
        inventory_warning_email,
        inventory_warning_threshold,
        id,
      })
    })
  }
  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {inventory_warning_email} = this.state
        const {inventory_warning_threshold, enable_inventory_warning} = values
        io.updateSetting(this.state.id, {
          enable_inventory_warning,
          inventory_warning_email,
          inventory_warning_threshold,
        })
          .then(() => message.success(_('保存成功')))
          .catch(e => message.error(e.toString()))
      }
    })
  }
  isValidEmail = val => {
    if (typeof val !== 'string') return
    return REGEXP_EMAIL.test(val.trim())
  }
  onChangeEmailInput = event => {
    this.setState({mailInputVal: event.currentTarget.value})
  }
  onAddEmail = (val, event) => {
    event.preventDefault()
    if (!this.isValidEmail(val)) {
      return message.info(_('你输入的似乎不是一个邮箱'))
    }
    const {inventory_warning_email} = this.state
    const mails = inventory_warning_email.slice(0)
    mails.push(val)
    this.setState({
      inventory_warning_email: mails,
      mailInputVal: '',
    })
  }
  onDelEmail = e => {
    const mail = e.currentTarget.dataset.email
    const {inventory_warning_email} = this.state
    const mails = inventory_warning_email.slice(0)
    mails.splice(mails.indexOf(mail), 1)
    this.setState({inventory_warning_email: mails})
  }
  render() {
    const breadcrumbList = [['', _('设置')], ['', _('库存预警')]]
    const {getFieldDecorator} = this.props.form
    const {enable_inventory_warning, inventory_warning_threshold, inventory_warning_email, mailInputVal} = this.state
    return (
      <React.Fragment>
        <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 8}} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem label={_('启用库存预警功能')}>
            {getFieldDecorator('enable_inventory_warning', {
              initialValue: enable_inventory_warning,
              valuePropName: 'checked',
            })(<Switch />)}
          </FormItem>
          <FormItem label={_('设置默认库存预警值')}>
            {getFieldDecorator('inventory_warning_threshold', {
              initialValue: inventory_warning_threshold,
              rules: [
                {
                  required: true,
                  message: _('请填写默认库存预警值'),
                },
              ],
            })(<InputNumber precision={0} style={{width: '50%'}} />)}
          </FormItem>
          <FormItem label={_('预警信息提示邮箱')}>
            <Search
              value={mailInputVal}
              onChange={this.onChangeEmailInput}
              style={{width: '50%', margin: 0}}
              onSearch={this.onAddEmail}
              enterButton={<Icon type='plus' />}
            />
          </FormItem>
          {!!inventory_warning_email.length && (
            <TailFormItem>
              <List
                dataSource={inventory_warning_email}
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

export default Form.create()(InventoryWarning)
