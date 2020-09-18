import ticket from './ticket'
import ticketBundle from './ticket-bundle'
import settings from './settings'
import prize from './prize'
import order from './order'
import prize_redemption_log from './prize_redemption_log'
import user from './user'
import user_profile from './user-profile'
import tour_and_lottery from './tour_and_lottery'
import sticker from './sticker'
import stickerUnlockLog from './sticker_unlock_log'

export default {
  ...ticket,
  ...ticketBundle,
  ...settings,
  ...prize,
  ...order,
  ...prize_redemption_log,
  ...user,
  ...user_profile,
  ...tour_and_lottery,
  ...sticker,
  ...stickerUnlockLog,
}
