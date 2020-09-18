import React from 'react'
import baseIO from '../io'
import routePath from '../config/route-path'
import {_} from 'i18n-utils'
import {Input, Form, message, Button} from 'antd'
import {FormItem, TailFormItem} from '../components/base-form'
import RouteBreadcrumb from '../components/router-breadcrumb'

class TicketTypeEditController extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      productList: [],
      id: null,
      name: '',
      english_name: '',
      english_description: '',
    }
  }

  componentDidMount() {
    const {match} = this.props
    const id = match.params.id
    this.setState({
      id: id || null,
    })
    if (id) {
      this.getTicketTypeDetail(id)
    }
  }

  getTicketTypeDetail(id) {
    baseIO.getTicketTypeDetailById(id).then(res => {
      let data = res.data
      this.setState({
        ...data,
      })
    })
  }

  handleClickCancel = () => {
    this.props.history.goBack()
  }

  handleClickSave = () => {
    const {id} = this.state
    this.props.form.validateFields((err, vals) => {
      if (!err) {
        let req = id ? baseIO.updateTicketTypeRecord(id, {...vals}) : baseIO.createTicketTypeRecord({...vals})
        const statusCode = id ? 200 : 201
        req.then(res => {
          if (res.status === statusCode) {
            message.success(_('保存成功'))
            this.props.history.push({pathname: routePath.ticketTypeList})
          }
        })
      }
    })
  }

  render() {
    const {id, name, description, english_name, english_description} = this.state
    const {getFieldDecorator} = this.props.form
    const breadcrumbList = [
      ['', _('产品管理')],
      [routePath.ticketTypeList, _('票种列表')],
      ['', id ? _('编辑票种') : _('新增票种')],
    ]

    return (
      <React.Fragment>
        <RouteBreadcrumb data={breadcrumbList} style={{marginBottom: 20}} />
        <Form>
          <FormItem label={_('票种名称')}>
            {getFieldDecorator('name', {
              initialValue: name,
              rules: [
                {
                  required: true,
                  message: _('请输入票种名称'),
                },
              ],
            })(<Input type='text' style={{width: 300}} />)}
          </FormItem>
          <FormItem label={_('英文名称')}>
            {getFieldDecorator('english_name', {
              initialValue: english_name,
              rules: [
                {
                  required: true,
                  message: _('请输入英文名称'),
                },
              ],
            })(<Input type='text' style={{width: 300}} />)}
          </FormItem>
          <FormItem label={_('票种描述')}>
            {getFieldDecorator('description', {
              initialValue: description,
              rules: [
                {
                  required: true,
                  message: _('请输入票种描述'),
                },
              ],
            })(<Input type='text' style={{width: 300}} />)}
          </FormItem>
          <FormItem label={_('票种英文描述')}>
            {getFieldDecorator('english_description', {
              initialValue: english_description,
              rules: [
                {
                  required: true,
                  message: _('请输入票种英文描述'),
                },
              ],
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
}

export default Form.create()(TicketTypeEditController)
