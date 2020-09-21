module.exports = {
  getEventUid(event) {
    return event.request.user.id
  },

  getEventUnionid(event) {
    return event.request.user.unionid
  },
}
