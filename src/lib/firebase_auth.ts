// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { User, getAuth, GoogleAuthProvider, signOut, deleteUser, signInWithPopup, onAuthStateChanged, updateCurrentUser } from "firebase/auth";
import { useEffect, useState } from "react";

const firebaseConfig = {

  apiKey: "AIzaSyBq37CbkSwb-k593FukS5x8bPnVIhVtYp4",
  authDomain: "geckoai-4517f.firebaseapp.com",
  projectId: "geckoai-4517f",
  storageBucket: "geckoai-4517f.firebasestorage.app",
  messagingSenderId: "483928161821",
  appId: "1:483928161821:web:52cf4dd4162fd25af750f4"

};

export const app = initializeApp(firebaseConfig);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
export const auth = getAuth(app);

export const sign_up_with_google = async () => {

  try{

    const result = await signInWithPopup(auth, provider);

    // gives google access token to access google api
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    
    // signed in user info
    const user = result.user;

    return {user, token};

  }

  catch(error: any){

    const error_object = {

      error_code: error.code,
      error_message: error.message,
      email: error.customData.email,
      credential: GoogleAuthProvider.credentialFromError(error),
      user: auth.currentUser,
      list: [

        `${error.message}`

      ]

    }

    throw error_object;

  }

};

export const useUser = () => { // hook to get user object

  const [user, set_user] = useState<User | null>(null);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (current_user) => {

      set_user(current_user);

    });

    return () => unsubscribe();

  }, []);

   if(user){

    console.log(user);
    
  }

  return user;

}

export const sign_out = async () => {

  try{

     await signOut(auth);

  }
  
  catch(error: any){

    const error_object = {

      error_code: error.code,
      error_message: error.message,
      email: error.customData.email,
      credential: GoogleAuthProvider.credentialFromError(error),
      list: [

        `Code: ${error.code}`,
        `Message: ${error.messsage}`,

      ]

    }

    throw error_object;
    
  }

};

export const delete_user = async () => {

  console.log("test");

};

