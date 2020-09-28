import React, {Suspense} from 'react'
import {HashRouter, Route, Switch} from 'react-router-dom'
import {ConfigProvider, Layout, Row, Col, Button, Alert} from 'antd'
import zh_CN from 'antd/es/locale/zh_CN'
import css from 'styled-jsx/css'

import {getAcl} from './utils/acl'
import MenuPanel from './menu-panel'
import PageLoading from './components/page-loading'
import RouterBreadcrumb from './components/router-breadcrumb'

const {Sider, Content} = Layout

const Welcome = () => <Alert message='欢迎进入【小美团】运营后台' />
const WithoutAccess = () => <Alert banner message='您没有当前页面的访问权限，请向管理员申请' />

export default class App extends React.Component {
  state = {
    loading: true,
    acl: {accessList: []},
  }

  componentDidMount() {
    getAcl().then(acl => {
      this.setState({acl, loading: false})
    })
  }

  renderRoute(route, list = []) {
    const {key, path, component, subRoute = [], hasAccess} = route

    if (path && component) {
      list.push(<Route exact key={key} path={path} component={hasAccess ? component : WithoutAccess} />)
    }

    const subList = subRoute.map(sub => this.renderRoute(sub, list))
    list.concat(subList)

    return list
  }

  logout = () => {
    const origin = window.location.origin
    window.location.href = 'https://cloud.minapp.com/logout/?next=' + origin
  }

  render() {
    const {loading, acl} = this.state
    const {isSuperAdmin, accessList = [], routeListWithAccess = []} = acl
    const hasDashboardAccess = isSuperAdmin || accessList.length

    return loading ? (
      <PageLoading />
    ) : (
      <HashRouter>
        <ConfigProvider locale={zh_CN} autoInsertSpaceInButton={false}>
          <Layout>
            <Sider {...style('sider')}>
              <h1 className='title'>小美团</h1>
              <MenuPanel acl={acl} />
            </Sider>

            <Content {...style('content')}>
              <Row type='flex' align='middle' justify='space-between' {...style('header')}>
                <Col span={21}>
                  <RouterBreadcrumb />
                </Col>
                <Col>
                  <Button ghost type='danger' onClick={this.logout}>
                    退出登录
                  </Button>
                </Col>
              </Row>

              <Suspense fallback={<PageLoading />}>
                <Switch>
                  <Route exact path='/' component={() => (hasDashboardAccess ? <Welcome /> : <WithoutAccess />)} />
                  {routeListWithAccess.map(route => this.renderRoute(route))}
                </Switch>
              </Suspense>
            </Content>

            <style jsx>{styles}</style>
            {componentStyles.styles}
          </Layout>
        </ConfigProvider>
      </HashRouter>
    )
  }
}

const styles = css`
  .title {
    padding: 12px 24px;
    font-size: 24px;
    color: #fff;
  }
`

const style = className => {
  return {className: `${componentStyles.className} ${className}`}
}

const componentStyles = css.resolve`
  .sider {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 200px;
    overflow: hidden;
  }

  .content {
    padding: 16px 24px 24px;
    margin-left: 200px;
    min-height: 100vh;
  }

  .header {
    padding-bottom: 16px;
  }
`
