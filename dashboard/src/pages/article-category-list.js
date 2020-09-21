import React from 'react'
import {Link, generatePath} from 'react-router-dom'
import {Radio, Button, Popconfirm, message} from 'antd'

import io from '../io'
import utils from '../utils'
import {ROUTE} from '../route'
import {ARTICLE_TYPE_NAME, ARTICLE_TYPE} from '../config/constants'
import Add from '../components/add'
import withBaseTable from '../components/with-base-table'

const db = io.articleCategory
const DEFAULT_ARTICLE_TYPE = ARTICLE_TYPE.OUTFIT

export default class ArticleCategoryList extends React.PureComponent {
  state = {
    meta: {},
    dataSource: [],
    articleType: this.type || DEFAULT_ARTICLE_TYPE,
    where: io.where.eq('type', this.type || DEFAULT_ARTICLE_TYPE).export(),
  }

  get type() {
    const {match} = this.props
    return match.params.type
  }

  componentDidMount() {
    this.getDataSource()
  }

  getDataSource(params = {offset: 0, limit: 1000}) {
    const {where} = this.state

    return db
      .find({
        where,
        ...params,
      })
      .then(res => {
        const {meta, objects} = res.data

        const dataSource = objects.filter(item => !item.pid)
        dataSource.forEach(category => {
          const children = objects.filter(item => item.pid === category.id)
          if (!category.active) children.forEach(item => (item.disabled = true))
          category.children = children
        })

        this.setState({meta, dataSource})
        return res
      })
  }

  toggleActive = (id, active) => {
    db.update(id, {active: !active}).then(res => {
      message.success(`${active ? '关闭' : '激活'}成功`)
      utils.sendAdminOperationLog(this.props, active ? '关闭' : '激活')
      this.getDataSource(this.state.meta)
    })
  }

  onChangeWhere = (where = {}, articleType) => {
    this.setState({where, articleType}, this.getDataSource)
  }

  render() {
    const columns = [
      {
        title: '分类名称',
        dataIndex: 'name',
        width: 500,
      },
      {
        title: '状态',
        dataIndex: 'active',
        render: (val, row) => (val && !row.disabled ? '已激活' : '已关闭'),
      },
      {
        title: '操作',
        key: 'action',
        render: (val, row) => (
          <>
            <Button type='primary' ghost>
              <Link to={generatePath(ROUTE.ARTICLE_CATEGORY_EDIT, {type: this.state.articleType, id: row.id})}>
                编辑
              </Link>
            </Button>
            {!row.disabled && (
              <Popconfirm
                title={`确认${row.active ? '关闭' : '激活'}?`}
                onConfirm={() => this.toggleActive(row.id, row.active)}
              >
                <Button type='danger' ghost>
                  {row.active ? '关闭' : '激活'}
                </Button>
              </Popconfirm>
            )}
          </>
        ),
      },
    ]

    return (
      <BaseTable
        {...this.props}
        columns={columns}
        onChangeWhere={this.onChangeWhere}
        articleType={this.state.articleType}
        dataSource={this.state.dataSource}
        pagination={false}
        size='small'
      />
    )
  }
}

const BaseTable = withBaseTable(
  props => <Filter {...props} />,
  props => <Add path={generatePath(ROUTE.ARTICLE_CATEGORY_ADD, {type: props.articleType})} {...props} />
)

class Filter extends React.PureComponent {
  handleSubmit = e => {
    const {value} = e.target
    const where = io.where.eq('type', value).export()
    this.props.onChangeWhere(where, value)
  }

  render() {
    return (
      <>
        <Radio.Group defaultValue={this.props.articleType} buttonStyle='solid'>
          {Object.values(ARTICLE_TYPE).map(key => (
            <Radio.Button key={key} value={key} onClick={this.handleSubmit}>
              {ARTICLE_TYPE_NAME[key]}
            </Radio.Button>
          ))}
        </Radio.Group>
      </>
    )
  }
}
