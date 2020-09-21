import Where from './where'

import base from './base'
import common from './common'
import invokeCloudFunc from './invoke-cloud-func'

export default {
  get where() {
    return new Where()
  },

  base,
  invokeCloudFunc,
  ...common,
}
