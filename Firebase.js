// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNWNsMbTv5u8x3wZI-CD46MmGJB8e2NIs",
  authDomain: "gravasend-965f7.firebaseapp.com",
  databaseURL: "https://gravasend-965f7-default-rtdb.firebaseio.com",
  projectId: "gravasend-965f7",
  storageBucket: "gravasend-965f7.appspot.com",
  messagingSenderId: "359996352620",
  appId: "1:359996352620:web:741d1aa302eacbe5d8d049",
  measurementId: "G-D2EWKHP3Q3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
