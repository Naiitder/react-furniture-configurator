import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {AppProviders} from "./contexts/AppProviders.jsx";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAOKpHvtvfpW80UR1uuzaMcDrPWV5fBR7k",
    authDomain: "test-furniture-10458.firebaseapp.com",
    projectId: "test-furniture-10458",
    storageBucket: "test-furniture-10458.firebasestorage.app",
    messagingSenderId: "679143911692",
    appId: "1:679143911692:web:c193f2b87836e0d7ffd929"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppProviders>
            <App/>
        </AppProviders>
</React.StrictMode>,
)
