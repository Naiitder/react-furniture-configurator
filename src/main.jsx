import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {ConfiguratorProvider} from './contexts/Configurator.jsx'
import {RoomConfiguratorProvider} from "./contexts/RoomConfigurator.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
    <ConfiguratorProvider>
        <RoomConfiguratorProvider>
            <App/>
        </RoomConfiguratorProvider>
    </ConfiguratorProvider>
</React.StrictMode>,
)
