import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Select, TreeSelect, Input, Button, Modal, Radio} from 'antd'

import io from '../io'
import utils from '../utils'
import {ARTICLE_TYPE, ARTICLE_TYPE_NAME} from '../config/constants'
import FormItem from '../components/form-item'
import Ueditor from '../components/ueditor'
import Uploader from '../components/uploader'
import AddStoreModal from '../components/add-store-modal'

const db = io.article
const DEFAULT_ARTICLE_TYPE = ARTICLE_TYPE.OUTFIT

class ArticleEdit extends React.Component {
  state = {
    loading: true,
    formData: {},
    treeData: [],
    visible: false,
    where: io.where.eq('type', this.type || DEFAULT_ARTICLE_TYPE).export(),
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
    if (this.id) {
      db.get(this.id).then(res => {
        const formData = res.data || {}
        this.setState(
          {
            formData,
            where: io.where.eq('type', formData.type).export(),
          },
          () => {
            this.initCategory()
          }
        )
      })
    } else {
      this.initCategory()
    }
  }

  initCategory() {
    const {where} = this.state
    return io.articleCategory.find({limit: 1000, where}).then(res => {
      const categoryList = res.data.objects
      const treeData = categoryList.filter(item => !item.pid)
      treeData.forEach(category => {
        category.title = category.name
        category.key = category.id
        category.value = category.id
        category.selectable = false

        const children = categoryList.filter(item => item.pid === category.id)
        children.forEach(item => {
          item.title = item.name
          item.key = item.id
          item.value = item.id
        })
        category.children = children
      })
      this.setState({
        treeData,
        loading: false,
      })
    })
  }

  handleHideModal = () => {
    this.setState({
      visible: false,
    })
  }

  handleSaveStoreData = data => {
    const {formData} = this.state
    formData.store_data = data
    this.setState({
      formData,
      visible: false,
    })
  }

  handleSubmit = e => {
    const {formData} = this.state
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) return
      Modal.confirm({
        title: '确定保存？',
        onOk: () => {
          utils.form.formatFields(data)
          data.store_data = formData.store_data ? formData.store_data : {}
          const req = this.id ? db.update(this.id, data) : db.create(data)
          req.then(() => utils.sendAdminOperationLog(this.props)).then(this.goBack)
        },
      })
    })
  }

  goBack = () => this.props.history.goBack()

  onChangeArticleType = articleType => {
    this.setState(
      {
        articleType,
        where: io.where.eq('type', articleType).export(),
      },
      () => {
        this.props.form.setFieldsValue({
          category: [],
        })
        this.initCategory()
      }
    )
  }

  render() {
    const {getFieldDecorator, getFieldValue} = this.props.form
    const {formData, treeData, loading, visible} = this.state

    return loading ? null : (
      <>
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

          <FormItem label='文章分类'>
            {getFieldDecorator('category', {
              initialValue: formData.category || [],
              rules: utils.form.setRules({type: 'array'}),
            })(
              <TreeSelect
                multiple
                dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                treeData={treeData}
                placeholder='请选择文章分类'
                treeDefaultExpandAll
              />
            )}
          </FormItem>

          <FormItem label='文章封面'>
            {getFieldDecorator('cover', {
              initialValue: formData.cover || '',
              rules: utils.form.setRules(),
            })(<Uploader />)}
          </FormItem>

          {getFieldValue('type') !== ARTICLE_TYPE.PICTURE ? (
            <FormItem label='是否推荐到首页'>
              {getFieldDecorator('is_recommend', {
                initialValue: formData.is_recommend || false,
              })(
                <Radio.Group>
                  <Radio value>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
              )}
            </FormItem>
          ) : null}

          {getFieldValue('type') !== ARTICLE_TYPE.PICTURE ? (
            <FormItem label='标题'>
              {getFieldDecorator('title', {
                initialValue: formData.title || '',
                rules: utils.form.setRules({required: false}),
              })(<Input />)}
            </FormItem>
          ) : null}

          <FormItem label='内容'>
            {getFieldDecorator('description', {
              initialValue: formData.description || '',
              rules: utils.form.setRules({required: false}),
            })(<Ueditor />)}
          </FormItem>
          {getFieldValue('type') !== ARTICLE_TYPE.PICTURE ? (
            <FormItem>
              <Button type='primary' onClick={() => this.setState({visible: true})}>
                编辑商家信息
              </Button>
            </FormItem>
          ) : null}
          <FormItem>
            <Button onClick={this.goBack}>取消</Button>
            <Button type='primary' htmlType='submit'>
              保存
            </Button>
          </FormItem>
        </Form>
        <AddStoreModal
          visible={visible}
          onCancel={this.handleHideModal}
          storeData={formData.store_data || {}}
          onSubmit={this.handleSaveStoreData}
        />
      </>
    )
  }
}

export default withRouter(Form.create()(ArticleEdit))
