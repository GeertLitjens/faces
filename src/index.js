import React from 'react'
import { render } from 'react-dom'
import 'ace-css/css/ace.min.css'

import App from './components/App'
import './index.css'

window.appInstance = render(<App />, document.getElementById('root'))
