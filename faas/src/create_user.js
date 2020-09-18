const constants = require('./constants')

const getUserTableObject = () => new BaaS.TableObject(constants.BAAS_TABLE_ID.user)

module.exports = async function(event, callback) {
  const userId = parseInt(event.request.user.id)
  const unionid = event.data.unionid
  try {
    try {
      await getUserById(userId)
    } catch (err) {
      const res = await createUser({id: userId, unionid})
      callback(null, {
        message: 'success',
        user: res.data,
      })
    }
  } catch (err) {
    callback(err)
  }
}

function getUserById(id) {
  return getUserTableObject()
    .get(id)
    .catch(err => {
      console.log('找不到用户')
      throw err
    })
}

function createUser({id, unionid}) {
  const newUser = getUserTableObject().create()
  newUser.set({
    unionid,
    created_by: id,
  })
  return newUser.save().catch(err => {
    console.log('创建用户时出错', err)
    throw err
  })
}
