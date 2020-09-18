import React from 'react'
import ReactDOM from 'react-dom'
import 'nprogress/nprogress.css'
import 'antd/dist/antd.css'
import './index.css'
import './polyfill'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'))

registerServiceWorker()
