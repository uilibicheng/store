import React from 'react'
import {Menu, Layout, Button, Alert} from 'antd'
import {Route, HashRouter, NavLink, withRouter, matchPath} from 'react-router-dom'
import {_, localeInit, getUserLanguage} from 'i18n-utils'
import toggerImg from './assets/image/arrow.png'

import locales from './assets/locales.json'
import routePath from './config/route-path'
import {LANG, SIGN_OUT_URL} from './config/constants'
import utils from './utils'

import Acl from './utils/acl'

const langStorageKey = 'WINDOW_LANG'
window.LANG = utils.getStorage(langStorageKey) || getUserLanguage()
localeInit(locales)

const {Content, Sider} = Layout
const SubMenu = Menu.SubMenu

// 初始化 Acl
const acl = new Acl()

const MenuComponent = withRouter(({history, menuList, togger, handleClickTogger}) => {
  let openKeys = []
  let selectedKeys = []
  for (const main of menuList) {
    const {path, children, key: mainKey} = main
    const isMatch = !!path && !!matchPath(history.location.pathname, {path, exact: main.exact})
    if (isMatch) {
      selectedKeys = [mainKey]
      break
    }
    if (children && children.length) {
      for (const sub of children) {
        const {path, key: subKey} = sub
        const isMatch = !!path && !!matchPath(history.location.pathname, {path, exact: sub.exact})
        if (isMatch) {
          openKeys = [mainKey]
          selectedKeys = [subKey]
        }
      }
    }
  }

  const changeLang = () => {
    const currentLang = window.LANG
    utils.setStorage(langStorageKey, currentLang === LANG.ZH ? LANG.EN : LANG.ZH)
    window.location.reload()
  }

  return (
    <Sider style={styl.sider} width={togger ? 40 : 260}>
      {!togger && (
        <div style={styl.siderTitle}>
          <span>{_('默林乐高商店')}</span>
          <Button ghost size='small' shape='circle' style={styl.langBtn} onClick={changeLang}>
            {window.LANG === LANG.ZH ? 'EN' : '中'}
          </Button>
        </div>
      )}
      {!togger && (
        <Menu
          className='nav nav-tabs'
          mode='inline'
          theme='dark'
          defaultSelectedKeys={[routePath.aquariumInfo]}
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
        >
          {menuList
            .map(menu => {
              if (!menu.label) return null
              if (!menu.children) {
                return (
                  <Menu.Item key={menu.key}>
                    <NavLink to={menu.path}>{_(menu.label)}</NavLink>
                  </Menu.Item>
                )
              }
              if (menu.children.length) {
                return (
                  <SubMenu title={_(menu.label)} key={menu.key}>
                    {menu.children
                      .map(subMenu => {
                        if (!subMenu.label) return null
                        return (
                          <Menu.Item key={subMenu.key}>
                            <NavLink to={subMenu.path}>{_(subMenu.label)}</NavLink>
                          </Menu.Item>
                        )
                      })
                      .filter(Boolean)}
                  </SubMenu>
                )
              }
              return null
            })
            .filter(Boolean)}
        </Menu>
      )}
      <div onClick={handleClickTogger} style={togger ? styl.siderToggerNone : styl.siderTogger}>
        <div style={styl.toggerImg} className={togger ? 'collapsed' : ''} />
      </div>
    </Sider>
  )
})

class App extends React.Component {
  state = {
    loading: true,
    togger: false,
  }

  componentWillMount() {
    acl.init().then(() => this.setState({loading: false}))
  }

  get routeList() {
    const routeList = []

    acl.routeListWithPerm.forEach(route => {
      const {path, component, exact} = route
      routeList.push({path, component, exact})
    })
    return routeList
  }

  handleClickTogger = () => {
    const {togger} = this.state
    this.setState({
      togger: !togger,
    })
  }

  handleSignOut = () => {
    window.location.href = SIGN_OUT_URL
  }

  render() {
    const {canAccess} = acl
    const {loading, togger} = this.state
    if (loading) return null
    if (!canAccess) return <Alert message={_('不具备访问权限，请向管理员申请')} banner />
    return (
      <HashRouter>
        <Layout>
          <MenuComponent handleClickTogger={this.handleClickTogger} menuList={acl.menuListWithPerm} togger={togger} />
          <Layout style={togger ? styl.contentWrapNone : styl.contentWrap}>
            <Button type='danger' ghost style={styl.logOut} onClick={this.handleSignOut}>
              {_('退出登录')}
            </Button>
            <Content style={styl.content}>
              <div style={styl.controllerWrap}>
                {this.routeList.map((props, index) => (
                  <Route key={index} {...props} />
                ))}
              </div>
            </Content>
          </Layout>
        </Layout>
      </HashRouter>
    )
  }
}

export default App

const styl = {
  langBtn: {fontSize: 12, transform: 'scale(.7)', verticalAlign: 'super'},
  sider: {overflow: 'auto', height: '100vh', position: 'fixed', left: 0},
  siderTitle: {height: 32, color: '#fff', margin: 16, fontSize: 18, width: 240},
  siderTogger: {
    position: 'fixed',
    bottom: 0,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 50,
    width: 260,
    height: 100,
    transition: 'all .25s',
    backgroundColor: '#001529',
  },
  siderToggerNone: {
    position: 'fixed',
    bottom: 0,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 50,
    width: 40,
    height: 100,
    transition: 'none',
    backgroundColor: '#001529',
  },
  toggerImg: {
    width: 20,
    height: 20,
    float: 'right',
    backgroundSize: 'cover',
    backgroundImage: `url(${toggerImg})`,
    transition: 'all .25s',
    transform: 'rotate(180deg)',
  },
  contentWrap: {
    marginLeft: 260,
    zIndex: 0,
    transition: 'none',
  },
  contentWrapNone: {
    marginLeft: 40,
    zIndex: 0,
    transition: 'all .25s',
  },
  logOut: {
    position: 'absolute',
    right: '2.5vw',
    top: 10,
    width: 80,
  },
  content: {padding: '35px 16px 0', overflow: 'auto', minHeight: '100vh'},
  controllerWrap: {padding: 24, minWidth: 960},
}
