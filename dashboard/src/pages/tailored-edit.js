import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, Select, Popconfirm, message} from 'antd'

import io from '../io'
import utils from '../utils'
import {TAILORED_TYPE_NAME, DATA_TYPE_NAME, CLOTHES_TYPE, CLOTHES_TYPE_NAME} from '../config/constants'
import withBaseTable from '../components/with-base-table'
import EditTailoredModal from '../components/edit-tailored-modal'
import '../assets/tailored.css'

const {Option} = Select

const db = io.tailored

class TailoredEdit extends React.Component {
  state = {
    loading: true,
    formData: {},
    dataSource: [],
    body_data: [],
    tailoring_data: [],
    visible: false,
    fieldData: {},
  }

  editFieldIndex = null
  selectType = ''
  body_data = []
  tailoring_data = []

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
      this.setState({
        formData,
        loading: false,
      })
      this.body_data = formData.body_data
      this.tailoring_data = formData.tailoring_data
      this.getDataSource()
    })
  }

  handleChoiceType = value => {
    this.selectType = value
    this.getDataSource()
  }

  getDataSource = () => {
    this.setState({
      dataSource: this.selectType ? this[this.selectType] : [...this.body_data, ...this.tailoring_data],
    })
  }

  handleShowModal = () => {
    this.setState({
      visible: true,
    })
  }

  handleHideModal = () => {
    this.setState({
      visible: false,
      fieldData: {},
    })
  }

  handleEditField = data => {
    const arr = [].concat(this[data.category])
    this.editFieldIndex = arr.findIndex(item => {
      if (data.clothes_type) {
        return item.name === data.name && item.clothes_type === data.clothes_type
      }
      return item.name === data.name
    })
    this.setState({
      visible: true,
      fieldData: data,
    })
  }

  handleDeleteField = data => {
    const arr = [].concat(this[data.category])
    const index = arr.findIndex(item => {
      if (data.clothes_type) {
        return item.name === data.name && item.clothes_type === data.clothes_type
      }
      return item.name === data.name
    })
    arr.splice(index, 1)
    this[data.category] = arr
    message.success('删除成功')
    this.getDataSource()
  }

  handleSaveOption = (data, isEdit) => {
    const arr = [].concat(this[data.category])
    if (isEdit) {
      arr[this.editFieldIndex] = data
    } else {
      arr.push(data)
    }
    this[data.category] = arr
    this.getDataSource()
    this.setState({
      visible: false,
      fieldData: {},
    })
    this.handleUpdateTailored()
  }

  handleUpdateTailored = back => {
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) return
      utils.form.formatFields(data)
      data.body_data = this.body_data
      data.tailoring_data = []
      Object.keys(CLOTHES_TYPE).forEach(key => {
        const arr = this.tailoring_data.reduce((result, item) => {
          if (CLOTHES_TYPE[key] === item.clothes_type) {
            result.push(item)
          }
          return result
        }, [])
        data.tailoring_data = data.tailoring_data.concat(arr)
      })
      const req = this.id ? db.update(this.id, data) : db.create(data)
      return req
        .then(() => utils.sendAdminOperationLog(this.props))
        .then(() => {
          message.success('保存成功')
          if (back) {
            this.goBack()
          }
        })
    })
  }

  handleSubmit = () => {
    this.handleUpdateTailored(true)
  }

  goBack = () => this.props.history.goBack()

  render() {
    const {getFieldDecorator} = this.props.form
    const {dataSource, formData, loading, visible, fieldData} = this.state
    const columns = [
      {
        title: '字段名称',
        dataIndex: 'name',
      },
      {
        title: '数据类型',
        dataIndex: 'type',
        render: val => DATA_TYPE_NAME[val],
      },
      {
        title: '衣服类型',
        dataIndex: 'clothes_type',
        render: val => (val ? CLOTHES_TYPE_NAME[val] : '无'),
      },
      {
        title: '一级分类',
        dataIndex: 'category',
        render: val => TAILORED_TYPE_NAME[val],
      },
      {
        title: '操作',
        key: 'action',
        ixed: 'right',
        width: 250,
        render: (val, row, index) => (
          <>
            <Button type='primary' ghost style={{margin: '0px 8px'}} onClick={() => this.handleEditField(row)}>
              编辑
            </Button>
            <Popconfirm title='确认删除' onConfirm={() => this.handleDeleteField(row, index)}>
              <Button type='danger' ghost>
                删除
              </Button>
            </Popconfirm>
          </>
        ),
      },
    ]
    return loading ? null : (
      <>
        <Form layout='inline' onSubmit={this.handleSubmit} className='tailored-form'>
          <Form.Item label='量体表名称'>
            {getFieldDecorator('name', {
              initialValue: formData.name || '',
              rules: utils.form.setRules({message: '请填写量体表名称'}),
            })(<Input style={{width: 250}} />)}
          </Form.Item>
          <div style={style.headerWrap}>
            <Select style={{width: 200}} placeholder='选择分类' onChange={this.handleChoiceType}>
              <Option value=''>全部</Option>
              {Object.keys(TAILORED_TYPE_NAME).map(key => {
                return (
                  <Option value={key} key={key}>
                    {TAILORED_TYPE_NAME[key]}
                  </Option>
                )
              })}
            </Select>
            <Button type='primary' onClick={this.handleShowModal}>
              添加字段
            </Button>
          </div>
          <BaseTable
            {...this.props}
            columns={columns}
            rowKey='index'
            dataSource={dataSource}
            pagination={utils.pagination()}
          />
          <div style={style.buttonGroup}>
            <Button onClick={this.goBack} style={{marginRight: '10px'}}>
              取消
            </Button>
            <Button type='primary' htmlType='submit'>
              保存
            </Button>
          </div>
        </Form>
        <EditTailoredModal
          visible={visible}
          dataSource={dataSource}
          width={600}
          onCancel={this.handleHideModal}
          fieldData={fieldData}
          onSubmit={this.handleSaveOption}
        />
      </>
    )
  }
}

const BaseTable = withBaseTable()
const style = {
  headerWrap: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  buttonGroup: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },
}

export default withRouter(Form.create()(TailoredEdit))
