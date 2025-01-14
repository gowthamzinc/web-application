// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl-QPmHsGvAlOou3LBwdE_feCWJhaqmRU",
  authDomain: "web-application-e2532.firebaseapp.com",
  projectId: "web-application-e2532",
  storageBucket: "web-application-e2532.firebasestorage.app",
  messagingSenderId: "654150770739",
  appId: "1:654150770739:web:5c67fc30b257ddb3ed8346"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
export {auth, firestore, app };