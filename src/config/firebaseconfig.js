// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCs8oY0PM4J-8Bmiy-BcgwNGCzdGIbyRDs",
  authDomain: "to-do-list-6a3e8.firebaseapp.com",
  databaseURL: "https://to-do-list-6a3e8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "to-do-list-6a3e8",
  storageBucket: "to-do-list-6a3e8.appspot.com",
  messagingSenderId: "752572005264",
  appId: "1:752572005264:web:c00628b56619f637be5115"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);