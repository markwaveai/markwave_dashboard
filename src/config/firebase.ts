import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBfBgdf_6Vo20QmiwX6fx1X5L0rdnXnt5g",
    authDomain: "markwave-481315.firebaseapp.com",
    projectId: "markwave-481315",
    storageBucket: "markwave-481315.firebasestorage.app",
    messagingSenderId: "612299373064",
    appId: "1:612299373064:web:16b92029f2a3a8ee0eefbd",
    measurementId: "G-0BH7HSXKDE"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { app, analytics, messaging };
