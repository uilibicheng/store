import React from 'react'
import {Row, Col, Icon} from 'antd'
import css from 'styled-jsx/css'

export default (WrappedComponent, hasSort = false) =>
  class extends React.Component {
    __index = 0

    state = {list: []}

    componentDidMount() {
      const {initialValue = []} = this.props

      let list = initialValue.map(item => ({
        __index: this.__index++,
        ...item,
      }))

      if (!list.length) list = [{__index: this.__index++}]
      this.setState({list})
    }

    genItem = () => ({__index: this.__index++})

    add = index => {
      const {onChange} = this.props
      const {list} = this.state
      const item = this.genItem()
      list.splice(index + 1, 0, item)
      this.setState({list: [...list]})
      onChange && onChange(trimIndex(list))
    }

    remove = index => {
      const {onChange} = this.props
      const {list} = this.state
      list.splice(index, 1)
      this.setState({list: [...list]})
      onChange && onChange(trimIndex(list))
    }

    onChange = (index, key, val) => {
      const {onChange} = this.props
      const {list} = this.state
      list[index][key] = val
      this.setState({list: [...list]})
      onChange && onChange(trimIndex(list))
    }

    render() {
      const {list = []} = this.state

      return (
        <>
          {list.map((item, index) => (
            <Row className='pct100' key={item.__index} type='flex'>
              <WrappedComponent
                {...this.props}
                data={item}
                index={index}
                onChange={(key, value) => this.onChange(index, key, value)}
              />
              <Col span={1} offset={1} {...style('add')}>
                {(list.length === index + 1 || !hasSort) && <Icon type='plus-circle' onClick={() => this.add(index)} />}
              </Col>
              {list.length > 1 && (
                <Col span={1} {...style('remove')}>
                  <Icon type='minus-circle' onClick={() => this.remove(index)} />
                </Col>
              )}
            </Row>
          ))}
          {componentStyles.styles}
        </>
      )
    }
  }

const trimIndex = list => {
  return list.map(item => {
    item = {...item}
    for (const field in item) {
      if (/^__\w.+/.test(field)) delete item[field]
    }
    return item
  })
}

const style = className => {
  return {className: `${componentStyles.className} ${className}`}
}

const componentStyles = css.resolve`
  .add,
  .remove {
    font-size: 24px;
    color: #1890ff;
  }

  .remove {
    color: #ff4d4f;
  }
`
