import React from 'react'
import {withRouter, generatePath} from 'react-router-dom'
import {Form, Input, Select, Button, Modal} from 'antd'

import io from '../io'
import utils from '../utils'
import {ROUTE} from '../route'
import {ARTICLE_TYPE, ARTICLE_TYPE_NAME} from '../config/constants'
import FormItem from '../components/form-item'

const db = io.articleCategory

class ArticleCategoryEdit extends React.Component {
  state = {
    loading: true,
    formData: {},
  }

  get type() {
    const {match} = this.props
    return match.params.type
  }

  get id() {
    const {match} = this.props
    return match.params.id
  }

  componentDidMount() {
    this.init()
  }

  init() {
    db.find({limit: 1000}).then(res => {
      const {objects} = res.data
      const categoryList = objects

      console.log('categoryList', categoryList)

      const rootCategroyList = objects.filter(item => !item.pid && item.type === this.type)
      console.log('rootCategroyList', rootCategroyList)

      const formData = objects.find(item => item.id === this.id) || {}
      this.setState({rootCategroyList, formData, loading: false})
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) return
      Modal.confirm({
        title: '确定保存？',
        onOk: () => {
          utils.form.formatFields(data)
          const req = this.id ? db.update(this.id, data) : db.create(data)
          req.then(() => utils.sendAdminOperationLog(this.props)).then(this.goBack)
        },
      })
    })
  }

  goBack = () => {
    if (this.type) {
      this.props.history.push(generatePath(ROUTE.ARTICLE_CATEGORY_LIST, {type: this.type}))
    } else {
      this.props.history.goBack()
    }
  }

  onChangeArticleType = articleType => this.setState({articleType})

  render() {
    const {getFieldDecorator} = this.props.form
    const {rootCategroyList, formData, loading} = this.state

    return loading ? null : (
      <Form onSubmit={this.handleSubmit}>
        <FormItem label='文章类型'>
          {getFieldDecorator('type', {
            initialValue: formData.type || this.type || ARTICLE_TYPE.OUTFIT,
            rules: utils.form.setRules(),
            onChange: this.onChangeArticleType,
          })(
            <Select placeholder='请选择文章类型'>
              {Object.values(ARTICLE_TYPE).map(item => (
                <Select.Option key={item}>{ARTICLE_TYPE_NAME[item]}</Select.Option>
              ))}
            </Select>
          )}
        </FormItem>

        <FormItem label='父级分类'>
          {getFieldDecorator('pid', {
            initialValue: formData.pid || '',
            rules: utils.form.setRules({required: false}),
          })(
            <Select placeholder='请选择父级分类' disabled={formData.name && !formData.pid}>
              <Select.Option value=''>无</Select.Option>
              {rootCategroyList.map(item => (
                <Select.Option key={item.id}>{item.name}</Select.Option>
              ))}
            </Select>
          )}
        </FormItem>

        <FormItem label='分类名称'>
          {getFieldDecorator('name', {
            initialValue: formData.name || '',
            rules: utils.form.setRules(),
          })(<Input />)}
        </FormItem>
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

export default withRouter(Form.create()(ArticleCategoryEdit))
