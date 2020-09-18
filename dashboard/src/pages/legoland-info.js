import React from 'react'
import {Form, Input, Button, message} from 'antd'
import UploaderFormItem from '../components/formitem-uploader'
import {FormItem, TailFormItem} from '../components/base-form'
import UeditorFormItem from '../components/formitem-ueditor'
import baseIO from '../io'
import {_} from 'i18n-utils'
import {FILE_GROUP_ID} from '../config/constants'

const FormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 15,
      offset: 6,
    },
  },
}

class LegolandInfoController extends React.PureComponent {
  constructor(props) {
    super(props)
    this.reactUeditor = null
    this.state = {
      legolandInfo: null,
      loading: true,
      banners: [],
      name: '',
      english_name: '',
      content: '',
    }
  }

  submit = () => {
    this.props.form.validateFields((err, vals) => {
      if (!err) {
        const newBanners = vals.banners.map(item => (item.url ? item.url : item))
        let data = {
          banners: newBanners,
          name: vals.name,
          english_name: vals.english_name,
          content: vals.content,
        }

        this.updatelegolandInfo(JSON.stringify(data))
      }
    })
  }

  componentDidMount() {
    this.getlegolandInfo()
  }

  getlegolandInfo() {
    baseIO.getlegolandInfoById().then(res => {
      const data = res.data.objects[0]
      if (data) {
        try {
          let introduction = data.introduction ? data.introduction : '{}'
          const value = JSON.parse(introduction)
          this.setState({
            legolandInfo: data,
            banners: value.banners || [],
            content: value.content ? value.content :'',
            name: value.name || '',
            english_name: value.english_name || '',
            loading: false,
          })
        } catch (err) {
          this.setState({
            loading: false,
          })
          throw new Error(err)
        }
      } else {
        this.setState({
          loading: false,
        })
      }
    })
  }

  updatelegolandInfo(value) {
    const {id} = this.state.legolandInfo
    baseIO.updatelegolandInfoById(id, {introduction: value, opt_type: 'legoland-info'})
      .then(res => {
        if (res.status === 200) {
          message.success(_('保存成功'))
        }
    })
  }

  onRemove = e => {
    const {banners} = this.state
    const index = banners.findIndex(v => v.uid === e.uid)
    const newImgList = banners.slice()
    newImgList.splice(index, 1)
    this.setState({
      banners: newImgList,
    })
  }

  render() {
    const {banners, loading, name, english_name, content} = this.state
    const {getFieldDecorator} = this.props.form

    return loading ? null : (
      <React.Fragment>
        <FormItem>
          <FormItem label={_('中文名称')}>
            {getFieldDecorator('name', {
              initialValue: name,
              rules: [
                {
                  required: true,
                  message: _('请输入中文名称'),
                },
              ],
            })(<Input type='text' style={{width: 400}} />)}
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
            })(<Input type='text' style={{width: 400}} />)}
          </FormItem>
          <FormItem label={_('banner 图')}>
            {getFieldDecorator('banners', {
              initialValue: banners,
              rules: [
                {
                  required: true,
                  message: _('请上传 banner 图'),
                },
              ],
            })(
              <UploaderFormItem
                categoryId={FILE_GROUP_ID.LEGOLAND_INFO}
                msg={_('支持 PNG，JPG，图片大小不超过 200 K，建议像素为') + ' 375 * 281'}
                name='cover'
                limit={Number.POSITIVE_INFINITY}
                listType='picture-card'
                showUploadList={{showPreviewIcon: false, showRemoveIcon: true}}
                beforeUpload={() => false}
              />
            )}
          </FormItem>
          <FormItem label={_('内容')}>
            {getFieldDecorator('content', {
              initialValue: content,
              rules: [
                {
                  required: true,
                  message: _('请输入内容'),
                },
              ],
            })(
              <UeditorFormItem />
            )}
          </FormItem>
        </FormItem>
        <TailFormItem {...FormItemLayout}>
          <Button style={{}} onClick={this.submit} type='primary' size='default'>
            {_('保存')}
          </Button>
        </TailFormItem>
      </React.Fragment>
    )
  }
}

const styl = {
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

export default Form.create()(LegolandInfoController)
