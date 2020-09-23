import {lazy} from 'react'

/**
 * 路由路径和对应的文件名严格一致
 * 例如 admin-list 对应 admin-list.js 或 admin-list/index.js
 * 为简化配置，各项路由不再设置固定的 key 来匹配权限，直接使用路由 path 进行匹配
 * 上线后文件名不允许更改，否则会影响权限控制
 */
export const ROUTE = {
  // 栏目
  PROGRAM_MANAGE: '/program-manage',
  // 轮播图
  BANNER_SETTING: '/banner-setting',
  BANNER_ADD: '/banner-edit',
  BANNER_EDIT: '/banner-edit/:id',
  // 用户
  USER_LIST: '/user-list',
  // 商家
  MERCHANT_LIST: '/merchant-list',
  MERCHANT_ADD: '/merchant-edit',
  MERCHANT_EDIT: '/merchant-edit/:id',
  RESTANURANT_SERVICE: '/restaurant-service',
  // ADMIN_LIST: '/admin-list',
  // ADMIN_ADD: '/admin-edit',
  // ADMIN_EDIT: '/admin-edit/:id',
  // ADMIN_OPERATION: '/admin-operation-log',
  // WECHAT_USER_LIST: '/wechat-user-list',
  // STORE_LIST: '/store-list',
  // STORE_ADD: '/store-edit',
  // STORE_EDIT: '/store-edit/:id',
  // TAILORED_LIST: '/tailored-list',
  // TAILORED_ADD: '/tailored-edit',
  // TAILORED_EDIT: '/tailored-edit/:id',
  // INVITATION_CODE_LIST: '/invitation-code-list',
  // ORDER_LIST: '/order-list',
  // ORDER_EDIT: '/order-edit/:id',
  // ARTICLE_CATEGORY_LIST: '/article-category-list/:type?',
  // ARTICLE_CATEGORY_ADD: '/article-category-edit/:type',
  // ARTICLE_CATEGORY_EDIT: '/article-category-edit/:type/:id',
  // ARTICLE_LIST: '/article-list/:type?',
  // ARTICLE_ADD: '/article-edit/:type',
  // ARTICLE_EDIT: '/article-edit/:type/:id',
}

/**
 * 拥有 menuTitle 字段的项，表示需要显示在菜单栏
 */
const routes = [
  {
    menuTitle: '门店管理',
    subRoute: [
      {
        menuTitle: '栏目管理',
        path: ROUTE.PROGRAM_MANAGE,
      },
      {
        menuTitle: '轮播图设置',
        path: ROUTE.BANNER_SETTING,
        subRoute: [
          {name: '新增轮播图', path: ROUTE.BANNER_ADD},
          {name: '编辑轮播图', path: ROUTE.BANNER_EDIT},
        ]
      },
    ],
  },
  {
    menuTitle: '商家管理',
    subRoute: [
      {
        menuTitle: '商家列表',
        path: ROUTE.MERCHANT_LIST,
        subRoute: [
          {'name': '新增商家', path: ROUTE.MERCHANT_ADD},
          {'name': '变价商家', path: ROUTE.MERCHANT_EDIT},
        ]
      },
      {
        menuTitle: '餐厅服务',
        path: ROUTE.RESTANURANT_SERVICE,
      }
    ]
  }
  // {
  //   menuTitle: '邀请码管理',
  //   subRoute: [
  //     {
  //       menuTitle: '邀请码列表',
  //       path: ROUTE.INVITATION_CODE_LIST,
  //     },
  //   ],
  // },
  // {
  //   menuTitle: '量体管理',
  //   subRoute: [
  //     {
  //       menuTitle: '量体列表',
  //       path: ROUTE.TAILORED_LIST,
  //       subRoute: [
  //         {name: '新增量体表', path: ROUTE.TAILORED_ADD},
  //         {name: '编辑量体表', path: ROUTE.TAILORED_EDIT},
  //       ],
  //     },
  //   ],
  // },
  // {
  //   menuTitle: '订单管理',
  //   subRoute: [
  //     {
  //       menuTitle: '订单列表',
  //       path: ROUTE.ORDER_LIST,
  //       subRoute: [{name: '编辑订单', path: ROUTE.ORDER_EDIT}],
  //     },
  //   ],
  // },
  // {
  //   menuTitle: '文章分类管理',
  //   path: ROUTE.ARTICLE_CATEGORY_LIST,
  //   subRoute: [
  //     {name: '新增文章分类', path: ROUTE.ARTICLE_CATEGORY_ADD},
  //     {name: '编辑文章分类', path: ROUTE.ARTICLE_CATEGORY_EDIT},
  //   ],
  // },
  // {
  //   menuTitle: '文章管理',
  //   path: ROUTE.ARTICLE_LIST,
  //   subRoute: [
  //     {name: '新增文章', path: ROUTE.ARTICLE_ADD},
  //     {name: '编辑文章', path: ROUTE.ARTICLE_EDIT},
  //   ],
  // },
  // {
  //   menuTitle: '权限管理',
  //   subRoute: [
  //     {
  //       menuTitle: '管理员列表',
  //       path: ROUTE.ADMIN_LIST,
  //       subRoute: [
  //         {name: '新增管理员', path: ROUTE.ADMIN_ADD},
  //         {name: '编辑管理员', path: ROUTE.ADMIN_EDIT},
  //       ],
  //     },
  //     {
  //       menuTitle: '管理员操作记录',
  //       path: ROUTE.ADMIN_OPERATION,
  //     },
  //     {
  //       menuTitle: '微信用户列表',
  //       path: ROUTE.WECHAT_USER_LIST,
  //     },
  //   ],
  // },
]

const lazyLoader = path => lazy(() => import(/* webpackChunkName: "chunk-[request]" */ `./pages/${parsePath(path)}`))

const parsePath = path => {
  path = path.indexOf('/') === 0 ? path.substring(1) : path
  return path.split('/:')[0]
}

/**
 * 构建 route 数据，自动添加 component 字段
 */
const genRoute = (route, index, parentIndex = null) => {
  index = index + 1
  const {path, component, subRoute = []} = route
  route.key = '' + index
  route.parentKey = '' + parentIndex
  route.subRoute = subRoute

  // 已定义 component 则跳过
  if (path && !component) route.component = lazyLoader(path)
  subRoute.forEach((sub, i) => genRoute(sub, index * 100 + i, index))
  return route
}

export const routeList = routes.map((route, index) => genRoute(route, index))
