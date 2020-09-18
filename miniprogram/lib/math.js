export default {
  getLen(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y)
  },

  dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y
  },

  getAngle(v1, v2) {
    var mr = this.getLen(v1) * this.getLen(v2)
    if (mr === 0) return 0
    var r = this.dot(v1, v2) / mr
    if (r > 1) r = 1
    return Math.acos(r)
  },

  cross(v1, v2) {
    return v1.x * v2.y - v2.x * v1.y
  },

  getRotateAngle(v1, v2) {
    var angle = this.getAngle(v1, v2)
    if (this.cross(v1, v2) > 0) {
      angle *= -1
    }

    return (angle * 180) / Math.PI
  },
}
