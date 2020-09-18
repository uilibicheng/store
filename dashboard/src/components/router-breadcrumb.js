import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb} from 'antd'
import {_} from 'i18n-utils'

export default function RouterBreadcrumb(props) {
  const {data, prefix = `${_('所在位置')}: `} = props
  return (
    <Breadcrumb {...props}>
      {data.map((entry, index) => (
        <Breadcrumb.Item key={entry[0]}>
          {index === 0 && prefix ? prefix : null}
          {entry[0] ? <Link to={entry[0]}>{entry[1]}</Link> : entry[1]}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  )
}
