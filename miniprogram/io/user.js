import {REMOTE_FUNCTION, BAAS_SCHEMA_ID} from '../config/constants'

const getUserTableObject = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.user)

export default {
  /**
   * 查询用户信息
   */
  getUserById(userID) {
    const query = new wx.BaaS.Query()
    query.compare('created_by', '=', userID)
    return getUserTableObject()
      .setQuery(query)
      .find()
      .then(res => {
        const data = res.data.objects.length > 0 ? res.data.objects[0] : undefined
        return {data}
      })
  },

  createUser(unionId) {
    return wx.BaaS.invokeFunction(REMOTE_FUNCTION.CREATE_USER, {
      unionid: unionId,
    }).then(res => {
      if (res.data && res.data.message === 'success') {
        return {
          data: res.data.order,
        }
      } else if (res.error && res.error.message) {
        throw res.error
      }
    })
  },

  updateUserLoginTime() {
    const MyUser = new wx.BaaS.User()
    const currentUser = MyUser.getCurrentUserWithoutData()
    const time = Math.floor(new Date().getTime() / 1000)

    currentUser.set('updated_at', time).update()
  },
}
