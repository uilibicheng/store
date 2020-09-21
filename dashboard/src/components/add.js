import React from 'react'
import {Button} from 'antd'

export default function Add(props) {
  const {path} = props
  return (
    <Button type='primary' onClick={() => props.history.push(path)}>
      新增
    </Button>
  )
}
