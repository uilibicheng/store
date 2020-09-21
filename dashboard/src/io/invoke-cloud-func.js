import io from './base'

export default function invokeCloudFunc(functionName, data, sync = true) {
  return new Promise((resolve, reject) =>
    io.invokeCloudFunc(functionName, data, (sync = true)).then(res => {
      return res.data.code === 0 ? resolve(res.data.data) : reject(res.data.error.message || '请求失败')
    }, reject)
  )
}
