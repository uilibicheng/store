module.exports = function(tableObject, query, orderBy = 'create_at') {
  return tableObject
    .setQuery(query)
    .orderBy(orderBy)
    .limit(1)
    .offset(0)
    .find()
    .then(res => {
      if (res.data.objects.length > 0) {
        return res.data.objects[0]
      } else {
        throw new Error('404: Not Found')
      }
    })
}
