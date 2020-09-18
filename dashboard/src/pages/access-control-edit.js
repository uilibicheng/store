import React from 'react'
import {NavLink, withRouter} from 'react-router-dom'
import {Button, Form, Input, message, Checkbox, Row, Col, Modal} from 'antd'
import {_} from 'i18n-utils'
import io from '../io'
import {BASIC_ROUTE, MENU_SHAPE} from '../utils/acl'

import routePath from '../config/route-path'
import {REGEXP_EMAIL} from '../config/constants'

import {FormItem, TailFormItem} from '../components/base-form'
import RouteBreadcrumb from '../components/router-breadcrumb'

const CheckboxGroup = Checkbox.Group
const modalConfirm = Modal.confirm
class AccessControlEdit extends React.PureComponent {
  controlMap = (function() {
    const result = {}
    MENU_SHAPE.forEach(i => {
      if (!Array.isArray(i.childrenKey)) {
        result[i.key] = [i.key]
      } else {
        result[i.key] = i.childrenKey
      }
    })
    return result
  })()

  nameMap = (function() {
    const result = {}
    MENU_SHAPE.concat(BASIC_ROUTE).forEach(i => {
      if (i.label) result[i.key] = i.label
    })
    return result
  })()

  componentDidMount() {
    this.getAccessControl()
  }

  state = {
    loading: true,
    name: '',
    email: '',
  }

  get id() {
    const {match} = this.props
    const id = match.params.id
    return id && id.trim() ? id.trim() : null
  }

  get controlList() {
    return Object.keys(this.controlMap)
  }

  getAccessControl = () => {
    if (this.id) {
      io.getAccessControlRecord(this.id).then(({data}) => {
        const state = {
          name: data.name,
          email: data.email,
          loading: false,
        }
        this.controlList.forEach(i => {
          data[i] && (state[i] = data[i])
        })
        this.setState(state)
      })
    } else {
      this.setState({loading: false})
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const pages = []
        this.controlList.map(i => (values[i] || []).map(j => pages.push(_(this.nameMap[j]))))
        if (!pages.length) {
          return message.info(_('至少要选择一项'))
        }
        const content = _('确定后，该用户即可有权查看{pages}页面，并进行新增、编辑等操作', {pages: pages.join('、')})
        modalConfirm({
          title: _('添加权限'),
          content,
          onOk: () => {
            const {history} = this.props
            const req = this.id ? this.updateAccessControl(values) : this.createAccessControl(values)
            req
              .then(() => {
                history.push(routePath.accessControlList)
              })
              .catch(e => message.error(e.toString()))
          },
          onCancel: () => {},
        })
      }
    })
  }

  createAccessControl = values => {
    return io.createAccessControlRecord(values)
  }

  updateAccessControl = values => {
    return io.updateAccessControlRecord(this.id, values)
  }

  render() {
    const {getFieldDecorator} = this.props.form
    const {name, email, loading, ...rest} = this.state
    const breadcrumbList = [
      [routePath.accessControlList, _('权限管理')],
      [routePath.accessControlList, _('用户列表')],
      ['', this.id ? _('编辑用户') : _('添加用户')],
    ]
    return loading ? null : (
      <React.Fragment>
        <RouteBreadcrumb data={breadcrumbList} style={{marginBottom: 20}} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem label={_('用户名称')}>
            {getFieldDecorator('name', {
              initialValue: name,
              rules: [
                {
                  required: true,
                  message: _('请输入用户名称'),
                },
              ],
            })(<Input style={{width: '50%'}} />)}
          </FormItem>
          <FormItem label={_('邮箱')}>
            {getFieldDecorator('email', {
              initialValue: email,
              rules: [
                {
                  required: true,
                  message: _('请输入用户邮箱账户'),
                },
                {
                  validator(rule, value, cb) {
                    REGEXP_EMAIL.test(value) ? cb() : cb(_('你输入的似乎不是一个邮箱'))
                  },
                },
              ],
            })(<Input disabled={!!this.id} style={{width: '50%'}} />)}
          </FormItem>
          <Row style={{fontSize: 18}}>
            <Col span={9}>
              <div style={{textAlign: 'right', paddingRight: 16, fontSize: 18}}>{_('权限设置')}</div>
            </Col>
            <Col span={15}>
              <span style={{fontSize: 14, color: '#999'}}>
                {`（${_('勾选后，该用户即可有权查看到对应的页面，并进行新增、编辑等操作')}）`}
              </span>
            </Col>
          </Row>
          {this.controlList.map(i => (
            <FormItem key={i} label={_(this.nameMap[i])}>
              {getFieldDecorator(i, {
                initialValue: rest[i] || [],
              })(
                <CheckboxGroup style={{width: '100%', lineHeight: 'inherit'}}>
                  <Row>
                    {this.controlMap[i].map(j => (
                      <Col span={8} key={j}>
                        <Checkbox value={j}>{_(this.nameMap[j])}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </CheckboxGroup>
              )}
            </FormItem>
          ))}
          <TailFormItem>
            <NavLink to={routePath.accessControlList}>
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

export default withRouter(Form.create()(AccessControlEdit))
