module.exports = function getUserInfo(userId) {
  const UserObject = new BaaS.User()
  return UserObject.get(userId).then(res => res.data)
}
