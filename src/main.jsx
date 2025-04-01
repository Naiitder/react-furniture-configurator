import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
// import App from './App.jsx'
import App from './AppCasco.jsx'
import {AppProviders} from "./contexts/AppProviders.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppProviders>
            <App/>
        </AppProviders>
</React.StrictMode>,
)
