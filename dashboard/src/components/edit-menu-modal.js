import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, InputNumber, Modal, Radio} from 'antd'

import utils from '../utils'
import FormItem from '../components/form-item'
import Uploader from '../components/uploader'
import withBaseTable from '../components/with-base-table'
import '../assets/tailored.css'

class EditMenuModal extends React.Component {
  state = {
    price: {
      original_price: 0,
      current_price: 0,
      discount: 0,
    }
  }

  componentDidMount() {
    const {formData} = this.props
    let price = {
      original_price: formData.original_price || 0,
      current_price: formData.current_price || 0,
      discount: formData.discount || 0,
    }
    this.setState({
      price,
    })
  }

  hideModal = () => {
    const {onCancel} = this.props
    onCancel()
  }

  changePrice = (value, key) => {
    let {price} = this.state
    price[key] = Number(value)
    if (price.original_price) {
      price.discount = Number(((price.current_price / price.original_price) * 10).toFixed(2).replace(/(0$)|(.00$)/, ''))
    }
    this.setState({
      price,
    })
  }

  handleSubmit = e => {
    const {onSubmit} = this.props
    const {price} = this.state
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) return
      const params = {}
      Object.keys(data).forEach(key => {
        if (key !== 'keys') {
          params[key] = data[key]
        }
      })
      params.original_price = price.original_price
      params.current_price = price.current_price
      params.discount = price.discount
      onSubmit && onSubmit(params)
    })
  }

  render() {
    const {
      visible,
      formData,
      form: {getFieldDecorator},
    } = this.props
    const {price} = this.state
    const title = formData.id ? '编辑菜品' : '新增菜品'

    const priceColumn = [
      {
        title: '原价',
        dataIndex: 'original_price',
        render: () => {
          return <InputNumber min={0} style={{width: '80px'}} value={price.original_price} onChange={value => {this.changePrice(value, 'original_price')}} />
        },
      },
      {
        title: '现价',
        dataIndex: 'current_price',
        render: () => {
          return <InputNumber min={0} style={{width: '80px'}} value={price.current_price} onChange={value => {this.changePrice(value, 'current_price')}} />
        },
      },
      {
        title: '折扣',
        dataIndex: 'discount',
        render: () => <span>{price.discount}</span>,
      },
    ]

    return (
      <Modal
        className='tailored-modal'
        style={{width: '600px'}}
        visible={visible}
        title={title}
        okText='确定'
        cancelText='取消'
        onCancel={this.hideModal}
        onOk={this.handleSubmit}
      >
        <Form>
          <FormItem label='菜品图片'>
            {getFieldDecorator('image', {
              initialValue: formData.image || '',
              rules: utils.form.setRules(),
            })(<Uploader />)}
          </FormItem>
          <FormItem label='名称'>
            {getFieldDecorator('name', {
              initialValue: formData && formData.name ? formData.name : '',
              rules: utils.form.setRules(),
            })(<Input />)}
          </FormItem>
          <FormItem label='价格'>
            <BaseTable
              style={{width: '300px'}}
              columns={priceColumn}
              dataSource={[price]}
              pagination={false}
            />
          </FormItem>
          <FormItem label='是否推荐'>
            {getFieldDecorator('is_recommend', {
              initialValue: formData.hasOwnProperty('is_recommend') ? formData.is_recommend : true,
              rules: utils.form.setRules({type: 'boolean'}),
            })(
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

const BaseTable = withBaseTable()
export default withRouter(Form.create()(EditMenuModal))
