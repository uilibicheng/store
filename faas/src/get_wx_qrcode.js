module.exports = async function getWXCode(event, callback) {
  const {data} = event
  BaaS.getWXACode(data.type, data.params, data.cdn, data.categoryName)
    .then(({data}) => {
      if (!data) {
        return callback(new Error('data is undefined'))
      }
      callback(null, {
        imageBase64: data.image,
        imageURL: data.download_url,
      })
    })
    .catch(err => {
      callback(err)
    })
}
