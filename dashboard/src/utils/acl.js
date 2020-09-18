import React from 'react'
import {message, Alert} from 'antd'
import io from '../io'
import routePath from '../config/route-path'
import {_} from 'i18n-utils'
import {setStorage} from './local-storage'

import legolandInfo from '../pages/legoland-info'
import ProductList from '../pages/product-list'
import ProductEdit from '../pages/product-edit'
import TicketBundleList from '../pages/ticket-bundle-list'
import TicketBundleEditor from '../pages/ticket-bundle-editor'
import OrderList from '../pages/order-list'
import OrderDetail from '../pages/order-detail'
import InventoryWarning from '../pages/inventory-warning'
import ExpiredWarning from '../pages/expired-warning'
import ClosedDate from '../pages/closed-date'
import TicketTypeList from '../pages/ticket-type-list'
import TicketTypeEdit from '../pages/ticket-type-edit'
import ProductCodeManage from '../pages/product-code-manage'
import BannerList from '../pages/banner-list'
import BannerEdit from '../pages/banner-edit'
import ConvertList from '../pages/convert-list'
import ConvertDetail from '../pages/convert-detail'
import PrizeList from '../pages/prize-list'
import PrizeEdit from '../pages/prize-edit'
import AccessControlList from '../pages/access-control-list'
import AccessControlEdit from '../pages/access-control-edit'
import UserLogList from '../pages/user-log'
import User from '../pages/user'
import MessageList from '../pages/message-list'
import MessageEdit from '../pages/message-edit'
import NotificationList from '../pages/notification-list'
import NotificationEdit from '../pages/notification-edit'
import StickerList from '../pages/sticker-list'
import StickerEdit from '../pages/sticker-edit'

/**
 * 1. 定义基础控制结构，具备 label 字段的项表示需要显示在菜单栏
 * 2. key 值可以重复，用于 UI 上菜单项 active 状态的索引
 * 3. 其余字段为 Route 或者菜单项额外所需字段
 */
export const BASIC_ROUTE = [
  {
    key: 'legoland_info',
    path: routePath.root,
    exact: true,
    component: legolandInfo,
  },
  {
    key: 'legoland_info',
    label: '乐高商店信息管理',
    path: routePath.legolandInfo,
    component: legolandInfo,
  },
  {
    key: 'ticket_bundle',
    label: '门票管理',
    path: routePath.ticketBundleList,
    component: TicketBundleList,
  },
  {
    key: 'ticket_bundle',
    path: routePath.ticketBundleEditor,
    component: TicketBundleEditor,
  },
  {
    key: 'ticket_type',
    label: '票种列表',
    path: routePath.ticketTypeList,
    component: TicketTypeList,
  },
  {
    key: 'ticket_type',
    path: routePath.ticketTypeEdit,
    component: TicketTypeEdit,
  },
  {
    key: 'product',
    label: '产品列表',
    path: routePath.productList,
    component: ProductList,
  },
  {
    key: 'product',
    path: routePath.productEdit,
    component: ProductEdit,
  },
  {
    key: 'prize',
    label: '奖品列表',
    path: routePath.prizeList,
    component: PrizeList,
  },
  {
    key: 'prize',
    path: routePath.prizeEdit,
    component: PrizeEdit,
  },
  {
    key: 'product_code',
    label: '二维码列表',
    path: routePath.productCodeManage,
    component: ProductCodeManage,
  },
  {
    key: 'order',
    label: '产品订单',
    path: routePath.orderList,
    component: OrderList,
  },
  {
    key: 'order',
    path: routePath.orderDetail,
    component: OrderDetail,
  },
  {
    key: 'convert',
    label: '兑换记录',
    path: routePath.convertList,
    component: ConvertList,
  },
  {
    key: 'convert',
    path: routePath.convertDetail,
    component: ConvertDetail,
  },
  {
    key: 'inventory_warning',
    label: '库存预警',
    path: routePath.inventoryWarning,
    component: InventoryWarning,
  },
  {
    key: 'expired_warning',
    label: '过期提醒',
    path: routePath.expiredWarning,
    component: ExpiredWarning,
  },
  {
    key: 'closed_date',
    label: '闭园日期',
    path: routePath.closedDate,
    component: ClosedDate,
  },
  {
    key: 'banner',
    label: 'banner 设置',
    path: routePath.bannerList,
    component: BannerList,
  },
  {
    key: 'banner',
    path: routePath.bannerEdit,
    component: BannerEdit,
  },
  {
    key: 'message',
    label: '活动消息发布',
    path: routePath.messageList,
    component: MessageList,
  },
  {
    key: 'message',
    path: routePath.messageEdit,
    component: MessageEdit,
  },
  {
    key: 'notification',
    label: '园区人流通知',
    path: routePath.notificationList,
    component: NotificationList,
  },
  {
    key: 'notification',
    path: routePath.notificationEdit,
    component: NotificationEdit,
  },
  {
    key: 'sticker',
    label: '贴纸列表',
    path: routePath.stickerList,
    component: StickerList,
  },
  {
    key: 'sticker',
    path: routePath.stickerEdit,
    component: StickerEdit,
  },
  {
    key: 'permission',
    label: '用户列表',
    path: routePath.accessControlList,
    component: AccessControlList,
  },
  {
    key: 'permission',
    path: routePath.accessControlEdit,
    component: AccessControlEdit,
  },
  {
    key: 'user_log',
    label: '操作记录',
    path: routePath.userLogList,
    component: UserLogList,
  },
  {
    key: 'user',
    label: '微信用户列表',
    path: routePath.user,
    component: User,
  },
]

/**
 * 菜单定义
 */
export const MENU_SHAPE = [
  {
    key: 'legoland_info',
    label: '乐高商店信息管理',
  },
  {
    key: 'product_manage',
    label: '产品管理',
    childrenKey: ['ticket_bundle', 'ticket_type', 'product'],
  },
  {
    key: 'prize_manage',
    label: '奖品管理',
    childrenKey: ['prize'],
  },
  {
    key: 'code_manage',
    label: '二维码管理',
    childrenKey: ['product_code'],
  },
  {
    key: 'order_manage',
    label: '订单管理',
    childrenKey: ['order', 'convert'],
  },
  {
    key: 'setting_manage',
    label: '设置',
    childrenKey: ['inventory_warning', 'banner', 'expired_warning', 'closed_date'],
  },
  {
    key: 'message_manage',
    label: '消息管理',
    childrenKey: ['message', 'notification'],
  },
  {
    key: 'sticker_manage',
    label: '贴纸管理',
    childrenKey: ['sticker'],
  },
  {
    key: 'permission_manage',
    label: '权限管理',
    childrenKey: ['permission', 'user_log', 'user'],
  },
]

export const ACCESS_CONTROL_LIST = [
  'legoland_info',
  'product_manage',
  'prize_manage',
  'code_manage',
  'order_manage',
  'setting_manage',
  'message_manage',
  'sticker_manage',
  'permission_manage',
]

export default class Acl {
  email = ''
  super_admin_email = ''
  accessField = {}

  get isSuperUser() {
    const {email, super_admin_email} = this
    return !!email.trim() && !!super_admin_email.trim() && email === super_admin_email
  }

  get canAccess() {
    let canAccess = this.isSuperUser
    if (!this.isSuperUser) {
      for (const i of ACCESS_CONTROL_LIST) {
        if (Array.isArray(this.accessField[i]) && !!this.accessField[i].length) {
          canAccess = true
          break
        }
      }
    }
    return canAccess
  }

  get canAccessKeyList() {
    const result = []
    const {accessField} = this
    Object.keys(accessField).forEach(i => {
      if (Array.isArray(accessField[i]) && accessField[i].length) {
        result.push(i, ...accessField[i])
      }
    })
    return result
  }

  get routeListWithPerm() {
    if (this.isSuperUser) {
      return [...BASIC_ROUTE]
    }
    const {canAccessKeyList} = this
    const result = []
    BASIC_ROUTE.forEach(i => {
      const route = {...i}
      if (!canAccessKeyList.includes(i.key)) {
        i.component = () => <Alert message={_('不具备访问权限，请向管理员申请')} banner />
      }
      result.push(route)
    })
    return result
  }

  get menuListWithPerm() {
    const {accessField} = this
    const menuList = []
    const menuItem = {}
    const menuShape = this.isSuperUser
      ? MENU_SHAPE
      : MENU_SHAPE.filter(i => Array.isArray(accessField[i.key]) && !!accessField[i.key].length)

    this.routeListWithPerm.forEach(i => {
      menuItem[i.key] ? menuItem[i.key].push(i) : (menuItem[i.key] = [i])
    })

    menuShape.forEach(menu => {
      const {key, label, childrenKey} = menu
      if (!childrenKey) {
        menuList.push(...menuItem[key])
      } else {
        const subMenuList = []
        const subAccessField = this.isSuperUser ? childrenKey : accessField[menu.key]
        childrenKey.forEach(subMenuKey => {
          if (subAccessField.includes(subMenuKey)) {
            subMenuList.push(...menuItem[subMenuKey])
          }
        })
        menuList.push({
          key,
          label,
          children: subMenuList,
        })
      }
    })

    return menuList
  }

  _getSuperUserEmail = () => {
    return io
      .getSettingList({limit: 1})
      .then(({data}) => (data.objects.length ? data.objects[0] : {}))
      .then(({super_admin_email}) => {
        this.super_admin_email = super_admin_email || ''
      })
  }

  _getUserEmail = () => {
    return io.getUserInfo().then(({data}) => {
      setStorage('userInfo', JSON.stringify(data))
      this.email = data.email || ''
    })
  }

  _getAclInfo = () => {
    return io
      .getAccessControlRecordByEmail(this.email)
      .then(data => {
        const accessField = {}
        ACCESS_CONTROL_LIST.forEach(i => {
          if (data[i]) accessField[i] = data[i]
        })
        this.accessField = accessField
      })
      .catch(() => message.error(_('访问权限获取失败')))
  }

  init = () => {
    return Promise.all([this._getSuperUserEmail(), this._getUserEmail()])
      .then(() => {
        if (!this.isSuperUser) return this._getAclInfo()
      })
      .catch(err => {
        message.error(err.toString())
      })
  }
}
