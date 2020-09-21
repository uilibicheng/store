import React from 'react'
import {withRouter, Link, matchPath} from 'react-router-dom'
import {Menu} from 'antd'

const parsePath = path => {
  path = path.indexOf('/') !== 0 ? `/${path}` : path
  return path.split('/:')[0]
}

class MenuPanel extends React.Component {
  render() {
    const {location, acl} = this.props
    const {routeListWithAccess = []} = acl
    const {selectedKeys, openKeys} = parseKeys(routeListWithAccess, location.pathname)

    return (
      <Menu
        theme='dark'
        mode='inline'
        defaultOpenKeys={openKeys}
        selectedKeys={selectedKeys}
        style={{height: '100%', borderRight: 0, overflowY: 'auto'}}
      >
        {routeListWithAccess.map(route => renderMenu(route, true))}
      </Menu>
    )
  }
}

export default withRouter(MenuPanel)

function renderMenu(route, isRootMenu = true) {
  const {menuTitle, key, path, subRoute, hasAccess} = route
  if (!hasAccess || (!isRootMenu && !menuTitle)) return

  if (subRoute.some(sub => sub.menuTitle)) {
    const node = subRoute.map(sub => renderMenu(sub, false))
    return (
      <Menu.SubMenu key={key} path={path} title={menuTitle}>
        {node}
      </Menu.SubMenu>
    )
  }

  return (
    <Menu.Item key={key}>
      <Link to={parsePath(path)}>{menuTitle}</Link>
    </Menu.Item>
  )
}

const parseKeys = (routeListWithAccess, pathname) => {
  const data = {}
  routeListWithAccess.forEach(route => genKeys(route, pathname, data))
  return data
}

const genKeys = (route, pathname, data = {}) => {
  const {menuTitle, path, key, parentKey, subRoute = []} = route
  subRoute.forEach(sub => genKeys(sub, pathname, data))

  if (matchPath(pathname, {path, exact: true})) {
    data.selectedKeys = [menuTitle ? key : parentKey]
    data.openKeys = [parentKey]
  }

  const {openKeys} = data
  if (menuTitle && openKeys) {
    if (openKeys.includes(key)) {
      openKeys.push(parentKey)
    }
  }
}
