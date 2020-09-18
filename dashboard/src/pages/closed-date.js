import React from 'react'
import {_} from 'i18n-utils'
import io from '../io'
import RouterBreadcrumb from '../components/router-breadcrumb'
import {Button, DatePicker, Tag, message} from 'antd'
import moment from 'moment-timezone'

export default class CloseDateController extends React.PureComponent {
  state = {
    isShowSelect: false,
    closed_times: [],
    id: null,
  }
  componentDidMount() {
    this.getCloseTimes()
  }

  getCloseTimes = () => {
    io.getSettingList({limit: 1})
      .then(({data}) => {
        const list = data && data.objects
      if (!list || !list.length) return
        const {closed_times = [], id = null} = data.objects[0]
        this.setState({
          closed_times,
          id,
        })
      })
  }

  handleTogglePicker = () => {
    this.setState({
      isShowSelect: !this.state.isShowSelect
    })
  }

  disabledDate = current => {
    const nowDate = moment().format('YYYY-MM-DD')
    return current && current.valueOf() < moment(nowDate).valueOf()
  }

  selectChange = (value, date) => {
    let selectArr = [...this.state.closed_times]
    let timeValue = String(moment(date).unix())
    if (selectArr.indexOf(timeValue) > -1) {
      return message.error(_('请勿重复选择'))
    }
    selectArr.push(timeValue)
    selectArr.sort()
    this.setState({
      closed_times: selectArr
    })
  }

  removeSelect = index => {
    let selectArr = [...this.state.closed_times]
    selectArr.splice(index, 1)
    this.setState({
      closed_times: selectArr
    })
  }

  handleClickCancel = () => {
    this.props.history.goBack()
  }

  handleSubmit = () => {
    const {id, closed_times} = this.state
    if (!id) return
    io.updateSetting(id, {closed_times})
      .then(() => message.success(_('保存成功')))
      .catch(e => message.error(e.toString()))
  }

  render() {
    const breadcrumbList = [['', _('设置')], ['', _('闭园日期')]]
    const {isShowSelect, closed_times} = this.state
    return (
      <React.Fragment>
        <div style={styl.breadcrumb}>
          <RouterBreadcrumb data={breadcrumbList} style={{marginBottom: 8}} />
        </div>
        <div>
        <Button style={styl.btn} onClick={this.handleTogglePicker}>{_('请选择闭园日期')}</Button>
        </div>
        <DatePicker
          open={isShowSelect}
          allowClear={false}
          style={styl.picker}
          disabledDate={this.disabledDate}
          onChange={this.selectChange}
        />
        {!closed_times.length ? null : (
          <div
            style={isShowSelect ? styl.boxActive : styl.box}>
            <p>{_('已选择闭园日期')}</p>
            <div style={styl.inputWrap}>
              {
                closed_times.map((item, index) => {
                  return <Tag
                    key={index}
                    closable
                    afterClose={() => this.removeSelect(index)}
                    style={{marginBottom: '3px'}}>
                    {moment.unix(item).format('YYYY-MM-DD')}
                  </Tag>
                })
              }
            </div>
          </div>
        )}
        <div>
          <Button style={styl.formBtn} type='default' onClick={this.handleClickCancel}>
            {_('取消')}
          </Button>
          <Button style={styl.formBtn} type='primary' onClick={this.handleSubmit}>
            {_('保存')}
          </Button>
        </div>
      </React.Fragment>
    )
  }
}

const styl = {
  breadcrumb: {marginBottom: '20px', display: 'flex', justifyContent: 'space-between'},
  warn: {color: '#fff', backgroundColor: 'red', paddingLeft: 6, paddingRight: 6, marginLeft: 10},
  btn: {width: '280px', height: '40px', lineHeight: '40px', marginBottom: '10px'},
  picker: {width: '280px'},
  box: {marginTop: '20px'},
  boxActive: {marginTop: '330px'},
  inputWrap: {
    width: '500px',
    minHeight: '100px',
    maxHeight: '300px',
    overflow: 'auto',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#d9d9d9',
    borderRadius: '4px',
    background: '#fff',
    padding: '5px',
  },
  formBtn: {
    width: 100,
    marginRight: 50,
    marginTop: 20,
  },
}