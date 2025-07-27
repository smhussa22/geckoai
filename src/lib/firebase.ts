// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyBq37CbkSwb-k593FukS5x8bPnVIhVtYp4",
  authDomain: "geckoai-4517f.firebaseapp.com",
  projectId: "geckoai-4517f",
  storageBucket: "geckoai-4517f.firebasestorage.app",
  messagingSenderId: "483928161821",
  appId: "1:483928161821:web:52cf4dd4162fd25af750f4"

};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();



