import React, {Component} from 'react'
import {Spin} from 'antd'

export default class PageLoading extends Component {
  render() {
    return <Spin style={style} />
  }
}

const style = {
  position: 'fixed',
  left: '50%',
  top: '40%',
  transform: 'translate(-50%)',
  zIndex: 999,
}
