import {routeList} from '../route'
import {matchPath} from 'react-router-dom'

export default {
  parse(pathname) {
    const breadcrumb = []
    routeList.forEach(route => genBreadcrumb(route, pathname, breadcrumb))
    return breadcrumb.reverse()
  },

  current(pathname) {
    return this.parse(pathname).reverse()[0]
  },
}

function genBreadcrumb(route, pathname, breadcrumb = []) {
  const {path, key, subRoute = []} = route
  subRoute.forEach(sub => genBreadcrumb(sub, pathname, breadcrumb))

  const match = matchPath(pathname, {path, exact: true})
  const breadcrumbParentRoute = breadcrumb.find(item => item.parentKey === key)

  if (match || breadcrumbParentRoute) {
    breadcrumb.push(route)
  }
}
