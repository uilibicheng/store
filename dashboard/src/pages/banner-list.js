import React from 'react'
import {NavLink, generatePath} from 'react-router-dom'
import routePath from '../config/route-path'
import baseIO from '../io'
import {_} from 'i18n-utils'
import {Table, Button, message, Modal} from 'antd'
import RouterBreadcrumb from '../components/router-breadcrumb'

const confirm = Modal.confirm

export default class BannerListController extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      bannerList: [],
      settingsId: '',
      currentIndex: '',
    }
  }

  componentDidMount() {
    this.getBannerList()
  }

  getBannerList() {
    baseIO
      .getSettingList()
      .then(res => {
        this.setState({
          bannerList: res.data.objects[0].banner,
          settingsId: res.data.objects[0].id,
        })
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  handleDelete = index => {
    this.setState({
      currentIndex: index,
    })

    confirm({
      title: _('确认删除?'),
      content: '',
      cancelText: _('取消'),
      okText: _('确认'),
      onOk: () => {
        this.handleOk()
      },
      onCancel() {},
    })
  }

  handleOk = () => {
    const {bannerList, settingsId, currentIndex} = this.state
    bannerList.splice(currentIndex, 1)
    baseIO
      .updateSetting(settingsId, {banner: bannerList, is_deleted: true, opt_type: 'banner', opt_id: settingsId})
      .then(res => {
        if (res.status === 200) {
          message.success(_('删除成功'))
          this.getBannerList()
        }
      })
  }

  render() {
    const {bannerList} = this.state
    const columns = [
      {
        title: _('序号'),
        key: 'index',
        width: 100,
        render: (val, row, index) => index + 1,
      },
      {
        title: _('banner 图'),
        key: 'img',
        render: (val, row, index) => {
          return <img src={row.img} alt='img' height={100} />
        },
      },
      {
        title: _('跳转地址'),
        key: 'redirectUrl',
        render: (val, row, index) => {
          return row.url ? row.url : '-'
        },
      },
      {
        title: _('操作'),
        key: 'action',
        render: (text, record, index) => {
          return (
            <div>
              <Button type='primary' ghost style={{marginBottom: 8, marginRight: 8}}>
                <NavLink to={generatePath(routePath.bannerEdit, {id: index})}>{_('编辑')}</NavLink>
              </Button>
              <Button type='danger' ghost onClick={() => this.handleDelete(index)}>
                {_('删除')}
              </Button>
            </div>
          )
        },
      },
    ]

    const breadcrumbList = [['', _('设置')], ['', _('banner 设置')]]

    return (
      <React.Fragment>
        <div style={styl.breadcrumb}>
          <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 8}} />
          <Button
            type='primary'
            onClick={() => {
              this.props.history.push({pathname: generatePath(routePath.bannerEdit)})
            }}
          >
            {_('新增 banner')}
          </Button>
        </div>
        <Table
          style={{backgroundColor: '#fff'}}
          pagination={false}
          rowKey={(row, index) => index}
          columns={columns}
          dataSource={bannerList}
        />
      </React.Fragment>
    )
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px', display: 'flex', justifyContent: 'space-between'},
}
