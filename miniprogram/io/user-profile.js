import utils from '../utils/index'
const getUserProfileTableObject = () => new wx.BaaS.User()

export default {
  updateUserLastLogin() {
    const user = getUserProfileTableObject().getCurrentUserWithoutData()
    return user.set('last_login', utils.getDatabaseTimeStamp(new Date().getTime())).update()
  },
}
