import {BAAS_SCHEMA_ID} from '../config/constants'

export default {
  /**
   * 获取设置
   */
  getSettings(label = 'default') {
    const Settings = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.settings)
    const query = new wx.BaaS.Query()
    query.compare('label', '=', label)
    return Settings.setQuery(query)
      .find()
      .then(res => {
        if (res.data.objects.length === 0) {
          throw new Error('配置信息未找到')
        } else {
          return {
            data: res.data.objects[0],
          }
        }
      })
  },

  /**
   * 获取抽奖设置
   */
  getLotterySettings() {
    const Settings = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.lottery_settings)
    const query = new wx.BaaS.Query()
    return Settings.setQuery(query)
      .find()
      .then(res => {
        if (res.data.objects.length === 0) {
          throw new Error('配置信息未找到')
        } else {
          return {
            data: res.data.objects[0],
          }
        }
      })
  },

  /**
   * 获取海洋馆介绍信息
   */
  // getAquariumInfo() {
  //   const Settings = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.settings_of_game)
  //   const query = new wx.BaaS.Query()
  //   query.compare('key', '=', 'aquarium_info')
  //   return Settings.setQuery(query)
  //     .find()
  //     .then(res => {
  //       if (res.data.objects.length === 0) {
  //         throw new Error('海洋馆信息未找到')
  //       } else {
  //         return {
  //           data: res.data.objects[0],
  //         }
  //       }
  //     })
  // },
}
