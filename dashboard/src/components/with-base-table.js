import React from 'react'
import {Table, Row, Col} from 'antd'

export default function withBaseTable(Left, Right) {
  return function BaseTable(props) {
    const {scrollable} = props

    return (
      <>
        <Row type='flex' justify='space-between'>
          {Left ? (
            <Col span={20} className='mb12'>
              <Left {...props} />
            </Col>
          ) : (
            <Col />
          )}
          {Right && (
            <Col className='mb12' style={{alignSelf: 'flex-end'}}>
              <Right {...props} />
            </Col>
          )}
        </Row>
        <Table rowKey={row => row.id} scroll={scrollable && {x: 'max-content'}} {...props} />
      </>
    )
  }
}
