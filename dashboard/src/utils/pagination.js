export default function pagination(meta = {}, onChange = () => {}) {
  const {total_count = 0, offset = 0, limit = 20} = meta

  return {
    total: total_count,
    pageSize: limit,
    current: offset / limit + 1,
    size: 'small',
    showQuickJumper: true,
    showTotal: num => `共 ${num} 条数据`,
    onChange: (page, size) => {
      onChange({
        offset: (page - 1) * size,
        limit: size,
      })
    },
  }
}
