import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyARPN0qMf16hnVuIkYpQVLCdhVJdxyRWkQ',
    authDomain: 'mood-lens.firebaseapp.com',
    projectId: 'mood-lens',
    storageBucket: 'mood-lens.appspot.com',
    messagingSenderId: '443308186470',
    appId: '1:443308186470:web:d03b017d0b6624ed4bc6a7',
    databaseURL: 'https://mood-lens-default-rtdb.firebaseio.com',
    measurementId: 'G-NM8ZKE0CE8'
};
// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// Get a reference to the Firebase Realtime Database
const db = getDatabase(firebaseApp);
export const storage = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp);

export default db;

