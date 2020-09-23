import {matchPath} from 'react-router-dom'
import {routeList} from '../route'
import io from '../io'

export default class Acl {
  isSuperAdmin = false

  currentUser = ''

  currentEmail = ''

  superAdminEmail = ''

  accessList = []

  routeListWithAccess = []

  init() {
    return Promise.all([this._getSuperUserEmail(), this._getCurrentEmail()])
      .then(res => {
        const {currentEmail, superAdminEmail} = this
        this.isSuperAdmin = currentEmail && superAdminEmail && currentEmail === superAdminEmail
        this.routeListWithAccess = routeList.map(route => this._genRouteWithAccess(route, true, this.isSuperAdmin))
        return this
      })
      .catch(err => {
        this.routeListWithAccess = routeList.map(route => this._genRouteWithoutAccess({...route}))
      })
      .finally(() => console.log(this))
  }

  _getSuperUserEmail() {
    return io.settings
      .first({
        where: io.where.eq('key', 'super_admin_email').export(),
      })
      .then(res => {
        const result = res.data || {}
        this.superAdminEmail = (result.value || '').trim()
      })
  }

  _getCurrentEmail() {
    return io.base.getUserInfo().then(res => {
      const {email} = res.data
      this.currentEmail = (email || '').trim()
    })
  }

  _genRouteWithoutAccess(route) {
    const {subRoute} = route
    route.hasAccess = false
    subRoute.forEach((sub, i) => this._genRouteWithoutAccess(sub))
    return route
  }

  _genRouteWithAccess(route, parentHasAccess = true, isSuperAdmin = false) {
    const {path, menuTitle, subRoute} = route
    if (isSuperAdmin) {
      route.hasAccess = true
    } else {
      const hasAccess = this._isMatchAccessPath(path)
      if (hasAccess || (!menuTitle && parentHasAccess)) {
        if (path) route.hasAccess = true
      } else if (menuTitle && subRoute.some(sub => this._isMatchAccessPath(sub.path))) {
        route.hasAccess = true
      } else {
        route.hasAccess = false
      }
    }

    subRoute.forEach((sub, i) => this._genRouteWithAccess(sub, route.hasAccess, isSuperAdmin))
    return route
  }

  _isMatchAccessPath(path) {
    return !!this.accessList.find(item => matchPath(path, {path: item, exact: true}))
  }
}

function cacheAcl() {
  let acl = null
  return () => {
    if (acl) return Promise.resolve(acl)

    return new Acl().init().then(res => (acl = res))
  }
}

export const getAcl = cacheAcl()
