import {lazy} from 'react'

/**
 * 路由路径和对应的文件名严格一致
 * 例如 admin-list 对应 admin-list.js 或 admin-list/index.js
 * 为简化配置，各项路由不再设置固定的 key 来匹配权限，直接使用路由 path 进行匹配
 * 上线后文件名不允许更改，否则会影响权限控制
 */
export const ROUTE = {
  // 栏目
  PROGRAM_MANAGE: '/shop-manage/program-manage',
  // 轮播图
  BANNER_SETTING: '/shop-manage/banner-setting',
  BANNER_ADD: '/shop-manage/banner-edit',
  BANNER_EDIT: '/shop-manage/banner-edit/:id',
  // 用户
  USER_LIST: '/user-list',
  // 商家
  MERCHANT_LIST: '/merchant-manage/merchant-list',
  MERCHANT_ADD: '/merchant-manage/merchant-edit',
  MERCHANT_EDIT: '/merchant-manage/merchant-edit/:id',
  MERCHANT_BANNER_MANAGE: '/merchant-manage/merchant-banner-manage/:merchantId',
  MERCHANT_COUPON_MANAGE: '/merchant-manage/merchant-coupon-manage/:merchantId',
  MERCHANT_COUPON_ADD: '/merchant-manage/merchant-coupon-edit/:merchantId/',
  MERCHANT_COUPON_EDIT: '/merchant-manage/merchant-coupon-edit/:merchantId/:id',
  MERCHANT_MENU_MANAGE: '/merchant-manage/merchant-menu-manage/:merchantId',
  MERCHANT_PACKAGE_MANAGE: '/merchant-manage/merchant-package-manage/:merchantId',
  MERCHANT_PACKAGE_ADD: '/merchant-manage/merchant-package-edit/:merchantId',
  MERCHANT_PACKAGE_EDIT: '/merchant-manage/merchant-package-edit/:merchantId/:id',
  MERCHANT_TYPE: '/merchant-manage/merchant-type',
  RESTANURANT_SERVICE: '/merchant-manage/restaurant-service',
  USER_LIST: '/user-manage/user-list'
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
          {'name': '编辑商家', path: ROUTE.MERCHANT_EDIT},
          {'name': '轮播图管理', path: ROUTE.MERCHANT_BANNER_MANAGE},
          {'name': '优惠券管理', path: ROUTE.MERCHANT_COUPON_MANAGE},
          {'name': '新增优惠券', path: ROUTE.MERCHANT_COUPON_ADD},
          {'name': '编辑优惠券', path: ROUTE.MERCHANT_COUPON_EDIT},
          {'name': '菜品管理', path: ROUTE.MERCHANT_MENU_MANAGE},
          {'name': '套餐管理', path: ROUTE.MERCHANT_PACKAGE_MANAGE},
          {'name': '新增套餐', path: ROUTE.MERCHANT_PACKAGE_ADD},
          {'name': '编辑套餐', path: ROUTE.MERCHANT_PACKAGE_EDIT},
        ]
      },
      {
        menuTitle: '商家类型',
        path: ROUTE.MERCHANT_TYPE,
      },
      {
        menuTitle: '餐厅服务',
        path: ROUTE.RESTANURANT_SERVICE,
      }
    ]
  },
  {
    menuTitle: '用户管理',
    subRoute: [
      {
        menuTitle: '用户列表',
        path: ROUTE.USER_LIST,
      }
    ]
  },
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
