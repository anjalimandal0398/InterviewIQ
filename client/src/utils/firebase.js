import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY ,
  authDomain: "interviewiq-33e12.firebaseapp.com",
  projectId: "interviewiq-33e12",
  storageBucket: "interviewiq-33e12.firebasestorage.app",
  messagingSenderId: "415023494143",
  appId: "1:415023494143:web:acc168e9a952111e4d6dca"
};

const app = initializeApp(firebaseConfig);

const auth=getAuth(app)

const provider=new GoogleAuthProvider()

export {auth,provider}