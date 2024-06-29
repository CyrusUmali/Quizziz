import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import Quizziz from './Quizziz'
// import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider  } from '@react-oauth/google';
ReactDOM.createRoot(document.getElementById('root')).render(
  <Router> <React.StrictMode>
    {/* <App /> */}


    <GoogleOAuthProvider clientId="460297050109-vg8lujpfnftm1bafbqsur8drtiv8tdic.apps.googleusercontent.com">
    
    <Quizziz/>

    </GoogleOAuthProvider>



  </React.StrictMode>   </Router>,
)
