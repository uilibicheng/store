import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Checkbox, Button, Modal, message, Row, Col} from 'antd'

import io from '../io'
import utils from '../utils'
import {routeList} from '../route'
import FormItem from '../components/form-item'

const db = io.access

class AdminEdit extends React.Component {
  state = {
    loading: true,
    formData: {},
  }

  get id() {
    const {match} = this.props
    return match.params.id
  }

  componentDidMount() {
    this.init()
  }

  init() {
    if (!this.id) return this.setState({loading: false})
    db.get(this.id).then(res => {
      const formData = res.data
      this.setState({formData, loading: false})
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) return
      if (!data.access.length) return message.warning('至少要选择一项权限')
      Modal.confirm({
        title: '添加权限',
        content: '确定后，该用户即可有权查看对应的页面，并进行新增、编辑等操作',
        onOk: () => {
          utils.form.formatFields(data)
          const req = this.id ? db.update(this.id, data) : db.create(data)
          req.then(() => utils.sendAdminOperationLog(this.props)).then(this.goBack)
        },
      })
    })
  }

  goBack = () => this.props.history.goBack()

  render() {
    const {getFieldDecorator} = this.props.form
    const {formData, loading} = this.state

    return loading ? null : (
      <Form onSubmit={this.handleSubmit}>
        <FormItem label='用户名称'>
          {getFieldDecorator('name', {
            initialValue: formData.name || '',
            rules: utils.form.setRules(),
          })(<Input />)}
        </FormItem>

        <FormItem label='邮箱'>
          {getFieldDecorator('email', {
            initialValue: formData.email || '',
            rules: utils.form.setRules(),
          })(<Input disabled={!!this.id} style={{width: '50%'}} />)}
        </FormItem>

        <Row style={{marginBottom: '24px'}}>
          <Col span={6} style={{textAlign: 'right', paddingRight: 16, fontSize: 18}}>
            权限设置
          </Col>
          <Col span={16} style={{color: '#999', lineHeight: '26px'}}>
            勾选后，该用户即可有权查看对应的页面，并进行新增、编辑等操作
          </Col>
        </Row>

        <Form.Item>
          {getFieldDecorator('access', {
            initialValue: formData.access || [],
          })(
            <Checkbox.Group style={{width: '100%', lineHeight: 'inherit'}}>
              {routeList.map((item, index) => (
                <Row key={index}>
                  <Col span={6} style={{textAlign: 'right', paddingRight: 16, fontSize: '16px'}}>
                    {item.menuTitle}
                  </Col>

                  <Col span={16}>
                    {item.subRoute.every(sub => !sub.menuTitle) && (
                      <Checkbox key={item.key} value={item.path}>
                        {item.menuTitle}
                      </Checkbox>
                    )}
                    {item.subRoute.map(
                      sub =>
                        sub.menuTitle && (
                          <Col span={6} key={sub.key}>
                            <Checkbox value={sub.path}>{sub.menuTitle}</Checkbox>
                          </Col>
                        )
                    )}
                  </Col>
                </Row>
              ))}
            </Checkbox.Group>
          )}
        </Form.Item>

        <FormItem>
          <Button onClick={this.goBack}>取消</Button>
          <Button type='primary' htmlType='submit'>
            保存
          </Button>
        </FormItem>
      </Form>
    )
  }
}

export default withRouter(Form.create()(AdminEdit))
