import base from './base'
import * as hotConfig from './hot-config'
import * as ticket from './ticket'
import * as order from './order'
import * as settings from './settings'
import * as ticketType from './ticket-type'
import * as ticketInventory from './ticket-inventory'
import * as product from './product'
import * as prize from './prize'
import * as message from './message'
import * as notification from './notification'
import * as legolandInfo from './legoland-info'
import * as accessControl from './access-control'
import * as userLog from './user-log'
import * as user from './user'
import * as exportTask from './export_task'
import * as sticker from './sticker'

export default {
  ...base,
  ...hotConfig,
  ...ticket,
  ...order,
  ...settings,
  ...ticketType,
  ...product,
  ...ticketInventory,
  ...ticketType,
  ...product,
  ...ticketInventory,
  ...prize,
  ...message,
  ...notification,
  ...legolandInfo,
  ...accessControl,
  ...userLog,
  ...user,
  ...exportTask,
  ...sticker,
}
