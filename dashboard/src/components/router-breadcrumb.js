import React from 'react'
import {withRouter, Link} from 'react-router-dom'
import {Breadcrumb} from 'antd'
import breadcrumb from '../utils/breadcrumb'

function RouterBreadcrumb(props) {
  const {location} = props
  const breadcrumbList = breadcrumb.parse(location.pathname)

  const parsePath = path => {
    if (!path) return
    return path.split('/:')[0]
  }

  return (
    <Breadcrumb>
      {breadcrumbList.map((item, index) => (
        <Breadcrumb.Item key={item.key}>
          {console.log('parsePath', parsePath(item.path))}
          {index === 0 ? '所在位置：' : ''}
          {item.path && item.path !== location.pathname && index < breadcrumbList.length - 1 ? (
            <Link to={parsePath(item.path)}>{item.menuTitle || item.name}</Link>
          ) : (
            item.menuTitle || item.name
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  )
}

export default withRouter(RouterBreadcrumb)
