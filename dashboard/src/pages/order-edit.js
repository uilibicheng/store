import React from 'react'
import {withRouter} from 'react-router-dom'
import {Form, Input, Button, Select, Checkbox, InputNumber, message} from 'antd'

import io from '../io'
import utils from '../utils'
import {DATA_TYPE, CLOTHES_TYPE_NAME, ORDER_STATUS_NAME, ORDER_STATUS} from '../config/constants'
import FormItem from '../components/form-item'
import '../assets/order.css'

const db = io.order
const {TextArea} = Input
const Option = Select.Option
const formItemLayout = {
  labelCol: {span: 9},
  wrapperCol: {span: 15},
}
const offsetItemLayout = {
  wrapperCol: {span: 24, offset: 0},
}

class OrderEdit extends React.Component {
  state = {
    loading: true,
    formData: {},
    currentTailoredIndex: 0,
    isEditStatus: false,
    isEditBodyData: false,
    isEditTailoredData: false,
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
    return db.get(this.id).then(res => {
      const formData = res.data
      if (!formData.tailored_id) {
        this.getStoreData(formData).then(data => {
          this.setState({
            formData: data,
            loading: false,
          })
        })
      } else {
        this.mergeData(formData).then(data => {
          data.product_list.forEach(product => {
            product.is_prefection = this.checkBodyDataIsPrefection(product)
          })
          this.setState({
            formData: data,
            loading: false,
          })
        })
      }
    })
  }

  checkBodyDataIsPrefection = data => {
    let flag = true // 根据该值判断是否填完信息 true 则是填完
    data.tailoring_data.forEach(tailoring => {
      if (tailoring.type === DATA_TYPE.TEXTAREA && !tailoring.value) {
        flag = false
      }
      if (tailoring.type === DATA_TYPE.TEXT || tailoring.type === DATA_TYPE.SELECT) {
        tailoring.options.forEach(option => {
          if (!option.value) flag = false
        })
      }
      if (tailoring.type === DATA_TYPE.CHECKBOX) {
        let hasValue = false
        tailoring.options.forEach(option => {
          if (option.value) hasValue = true
        })
        if (!hasValue) flag = false
      }
    })
    return flag
  }

  getStoreData = formData => {
    return io.store.find({where: {id: formData.store_id}, expand: 'tailored_id'}).then(res => {
      if (res.data.objects.length) {
        const store = res.data.objects[0]
        formData.store_name = store.name
        if (store.tailored_id) {
          formData.tailored_id = store.tailored_id.id
          formData.tailored_name = store.tailored_id.name
          formData.tailored_body_data = store.tailored_id.body_data
          formData.product_list.forEach(item => {
            item.tailoring_data = store.tailored_id.tailoring_data.reduce((result, data) => {
              if (item.clothes_type === data.clothes_type) {
                result.push(data)
              }
              return result
            }, [])
            item.is_prefection = false
          })
        }
      }
      return formData
    })
  }

  mergeData = formData => {
    return io.tailored.get(formData.tailored_id).then(res => {
      const {body_data, tailoring_data} = res.data
      formData.tailored_body_data = this.mergeBodyData(formData, body_data)
      formData.product_list = this.mergeTailoredData(formData.product_list, tailoring_data)
      return formData
    })
  }

  mergeBodyData = (formData, body_data) => {
    const arr = body_data.reduce((result, item) => {
      const findData = formData.tailored_body_data.find(data => {
        return item.name === data.name
      })
      // 当 findData 存在即能在订单的身体数据找到该字段
      if (findData) {
        if (item.options && item.options.length) {
          findData.options = item.options.reduce((optionList, option) => {
            // 在订单里的 options 查找是否有该选项
            const findOption = findData.options.find(findDataChild => {
              return findDataChild.name === option.name
            })
            if (findOption) {
              // 当有 child_options 即是下拉框的时候
              if (option.child_options) {
                findOption.child_options = option.child_options
                // 当有 value 值 判断新量体表是是否有该选项
                if (findOption.value) {
                  findOption.value = option.child_options.includes(findOption.value) ? findOption.value : ''
                }
              }
            }
            optionList.push(findOption || option)
            return optionList
          }, [])
        }
      }
      result.push(findData || item)
      return result
    }, [])
    return arr
  }

  mergeTailoredData = (product_list, tailoring_data) => {
    const arr = product_list.reduce((productList, product) => {
      product.tailoring_data = tailoring_data.reduce((result, item) => {
        if (item.clothes_type === product.clothes_type) {
          const findData = product.tailoring_data.find(data => {
            return item.name === data.name
          })
          if (findData) {
            if (item.options && item.options.length) {
              findData.options = item.options.reduce((optionList, option) => {
                // 在订单里的 options 查找是否有该选项
                const findOption = findData.options.find(findDataChild => {
                  return findDataChild.name === option.name
                })
                if (findOption) {
                  // 当有 child_options 即是下拉框的时候
                  if (option.child_options) {
                    findOption.child_options = option.child_options
                    // 当有 value 值 判断新量体表是是否有该选项
                    if (findOption.value) {
                      findOption.value = option.child_options.includes(findOption.value) ? findOption.value : ''
                    }
                  }
                }
                optionList.push(findOption || option)
                return optionList
              }, [])
            }
          }
          result.push(findData || item)
        }
        return result
      }, [])
      productList.push(product)
      return productList
    }, [])
    return arr
  }

  renderStatusSelect = (product, index) => {
    return (
      <div>
        <Select value={product.status} onChange={value => this.handleChangeStatus(value, index)} style={{width: 150}}>
          {Object.keys(ORDER_STATUS_NAME).map(item => {
            return (
              <Option value={item} key={item}>
                {ORDER_STATUS_NAME[item]}
              </Option>
            )
          })}
        </Select>
        {product.status === ORDER_STATUS.SEND_OUT || product.status === ORDER_STATUS.SEND_BACK ? (
          <InputNumber
            min={0}
            value={product[`${product.status}_count`]}
            onChange={value => this.handleCountChange(value, index, `${product.status}_count`)}
            style={{width: 80, marginLeft: 5}}
          />
        ) : null}
      </div>
    )
  }

  handleChangeStatus = (value, index) => {
    const formData = this.state.formData
    formData.product_list[index].status = value
    formData.product_status[index] = value
    this.setState({
      formData,
    })
  }

  handleCountChange = (value, index, key) => {
    const formData = this.state.formData
    formData.product_list[index][key] = value
    this.setState({
      formData,
    })
  }

  renderContent = (data, index, isEdit) => {
    if (data.type === DATA_TYPE.TEXT || data.type === DATA_TYPE.SELECT) {
      return data.options.map((item, optionIndex) => {
        return (
          <FormItem label={item.name} key={optionIndex} {...formItemLayout} className='form-item'>
            {data.type === DATA_TYPE.TEXT ? (
              <Input
                style={{width: 120}}
                disabled={!isEdit}
                value={item.value}
                onChange={e => this.handleChangeData(e.target.value, index, optionIndex)}
              />
            ) : data.type === DATA_TYPE.SELECT ? (
              <Select
                style={{width: 120}}
                disabled={!isEdit}
                value={item.value}
                onChange={value => this.handleChangeData(value, index, optionIndex)}
              >
                {item.child_options.map((child, childIndex) => {
                  return (
                    <Option value={child} key={childIndex}>
                      {child}
                    </Option>
                  )
                })}
              </Select>
            ) : null}
          </FormItem>
        )
      })
    }
    if (data.type === DATA_TYPE.CHECKBOX) {
      return (
        <div className='checkbox-group'>
          {data.options.map((child, optionIndex) => {
            return (
              <Checkbox
                checked={child.value}
                key={child.name}
                disabled={!isEdit}
                onChange={e => this.handleChangeData(e.target.checked, index, optionIndex)}
              >
                {child.name}
              </Checkbox>
            )
          })}
        </div>
      )
    }
    if (data.type === DATA_TYPE.TEXTAREA) {
      return (
        <TextArea
          autoSize={{minRows: 3, maxRows: 5}}
          disabled={!isEdit}
          value={data.value}
          onChange={e => this.handleChangeData(e.target.value, index)}
        />
      )
    }
  }

  changeEditStstus = (key, isEdit) => {
    if (key === 'isEditBodyData') {
      this.setState({
        isEditBodyData: isEdit,
        isEditTailoredData: false,
      })
    } else {
      this.setState({
        isEditTailoredData: isEdit,
        isEditBodyData: false,
      })
    }
  }

  handleChangeData = (value, index, optionIndex) => {
    const {currentTailoredIndex} = this.state
    const formData = JSON.parse(JSON.stringify(this.state.formData))
    if (this.state.isEditBodyData) {
      if (optionIndex !== undefined) {
        formData.tailored_body_data[index].options[optionIndex].value = value
      } else {
        formData.tailored_body_data[index].value = value
      }
    } else {
      if (optionIndex !== undefined) {
        formData.product_list[currentTailoredIndex].tailoring_data[index].options[optionIndex].value = value
      } else {
        formData.product_list[currentTailoredIndex].tailoring_data[index].value = value
      }
      formData.product_list[currentTailoredIndex].is_prefection = this.checkBodyDataIsPrefection(
        formData.product_list[currentTailoredIndex]
      )
    }
    this.setState({
      formData,
    })
  }

  changeStoreNote = e => {
    const {formData} = this.state
    formData.store_note = e.target.value
    this.setState({
      formData,
    })
  }

  handleSubmit = () => {
    return db.update(this.id, this.state.formData).then(() => {
      utils.sendAdminOperationLog(this.props, '编辑')
      message.success('保存成功')
      this.goBack()
    })
  }

  goBack = () => this.props.history.goBack()

  render() {
    const {loading, formData, currentTailoredIndex, isEditStatus, isEditBodyData, isEditTailoredData} = this.state

    return loading ? null : (
      <Form className='order-box'>
        <h2>订单号：{formData.order_id}</h2>
        <div className='order-item'>
          <div className='order-item-header'>商家信息</div>
          <div className='order-item_desc'>
            <p>商家名称：{formData.store_name}</p>
            <p>联系方式：{formData.store_phone}</p>
          </div>
        </div>
        <div className='order-item'>
          <div className='order-item-header'>客户信息</div>
          <div className='order-item_desc'>
            <p>客户名称：{formData.contact_name}</p>
            <p>
              头像：{formData.avatar ? <img className='avator' src={formData.avatar} style={{marginLeft: 10}} /> : ''}{' '}
            </p>
            <p>联系方式：{formData.contact_phone}</p>
          </div>
        </div>
        <div className='order-item'>
          <div className='order-item-header'>订单状态</div>
          <div className='order-status-list'>
            {formData.product_list.map((item, index) => {
              return (
                <div className='status-item' key={index}>
                  <p>
                    {CLOTHES_TYPE_NAME[item.clothes_type]} {item.clothes_type_index}：
                  </p>
                  {isEditStatus ? (
                    this.renderStatusSelect(item, index)
                  ) : (
                    <p>
                      {ORDER_STATUS_NAME[item.status]}
                      {item.status === ORDER_STATUS.SEND_OUT || item.status === ORDER_STATUS.SEND_BACK
                        ? `第 ${item[`${item.status}_count`]} 次`
                        : ''}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          <div className='btn-wrap'>
            {isEditStatus ? (
              <Button type='primary' onClick={() => this.setState({isEditStatus: false})}>
                保存
              </Button>
            ) : (
              <Button type='primary' onClick={() => this.setState({isEditStatus: true})}>
                修改订单状态
              </Button>
            )}
          </div>
        </div>
        <h2>{formData.tailored_name}</h2>
        <div className='order-item'>
          <div className='order-item-header'>身体数据</div>
          <div className='order-tailored'>
            {formData.tailored_body_data.map((item, index) => {
              return (
                <div className='tailored-wrap' key={index}>
                  <div className='tailored-header'>{item.name}</div>
                  <div className='tailored-item'>{this.renderContent(item, index, isEditBodyData)}</div>
                </div>
              )
            })}
          </div>
          <div className='btn-wrap'>
            {isEditBodyData ? (
              <Button type='primary' onClick={() => this.changeEditStstus('isEditBodyData', false)}>
                保存
              </Button>
            ) : (
              <Button type='primary' onClick={() => this.changeEditStstus('isEditBodyData', true)}>
                修改
              </Button>
            )}
          </div>
        </div>
        <div className='order-item'>
          <div className='order-item-header'>
            成衣数据
            <Select
              style={{width: 150, marginLeft: 20}}
              value={currentTailoredIndex}
              onChange={value => this.setState({currentTailoredIndex: value})}
            >
              {formData.product_list.map((item, index) => {
                return (
                  <Option key={index} value={index}>
                    <span className={!item.is_prefection ? 'danger-menu-item' : ''}>
                      {CLOTHES_TYPE_NAME[item.clothes_type]} {item.clothes_type_index}
                    </span>
                  </Option>
                )
              })}
            </Select>
          </div>
          <div className='order-tailored'>
            {formData.product_list[currentTailoredIndex].tailoring_data.map((item, index) => {
              return (
                <div className='tailored-wrap' key={index}>
                  <div className='tailored-header'>{item.name}</div>
                  <div className='tailored-item'>{this.renderContent(item, index, isEditTailoredData)}</div>
                </div>
              )
            })}
          </div>
          <div className='btn-wrap'>
            {isEditTailoredData ? (
              <Button type='primary' onClick={() => this.changeEditStstus('isEditTailoredData', false)}>
                保存
              </Button>
            ) : (
              <Button type='primary' onClick={() => this.changeEditStstus('isEditTailoredData', true)}>
                修改
              </Button>
            )}
          </div>
        </div>
        <FormItem {...offsetItemLayout}>
          <TextArea
            autoSize={{minRows: 4, maxRows: 6}}
            className='note'
            placeholder='商家备注信息'
            value={formData.store_note}
            onChange={e => this.changeStoreNote(e)}
          />
        </FormItem>
        <h2>查看附件</h2>
        {formData.tailored_image.length ? (
          <div className='note img-list'>
            {formData.tailored_image.map((item, index) => {
              return (
                <div className='image-wrap' key={index}>
                  <a href={item} target='_blank' rel='noreferrer noopener'>
                    <img src={item} className='image' />
                  </a>
                </div>
              )
            })}
          </div>
        ) : (
          <div>暂未上传量体图，请尽快上传。</div>
        )}
        <div style={style.buttonGroup}>
          <Button onClick={this.goBack} style={{marginRight: '10px'}}>
            取消
          </Button>
          <Button type='primary' onClick={this.handleSubmit}>
            保存
          </Button>
        </div>
      </Form>
    )
  }
}

const style = {
  buttonGroup: {
    width: '100%',
    display: 'flex',
    marginTop: '24px',
  },
}

export default withRouter(Form.create()(OrderEdit))
