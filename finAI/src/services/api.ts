import axios from 'axios';
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: "http://34.39.145.249:8080",
});

const firebaseConfig = {
    apiKey: "AIzaSyAEmShfxwKYMi5rNN3ZxAJeuGPe3IcaAAQ",
    authDomain: "desenvolvimento-sistemas-ii.firebaseapp.com",
    databaseURL: "https://desenvolvimento-sistemas-ii-default-rtdb.firebaseio.com",
    projectId: "desenvolvimento-sistemas-ii",
    storageBucket: "desenvolvimento-sistemas-ii.appspot.com",
    messagingSenderId: "99050348413",
    appId: "1:99050348413:web:b59a5772080b4b0e97f614",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export { api, app, database, auth };
