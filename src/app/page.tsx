'use client';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function HomePage() {
  
  const router = useRouter();

  const [sign_in_email, set_sign_in_email] = useState('');
  const [sign_in_password, set_sign_in_password] = useState('');
  const [create_email, set_create_email] = useState('');
  const [create_password, set_create_password] = useState('');
  const [clicked, set_click] = useState(false);

  const sign_in = async () => {

    await signInWithEmailAndPassword(auth, sign_in_email, sign_in_password);
    router.push('/taillink');

  }

  const create_account = async () => {

     try{

      await createUserWithEmailAndPassword(auth, create_email, create_password);

     }catch(error){

      console.log(error);

     }
    
  }
 
  return (
    
    <>

          <div className="h-screen flex flex-col gap-1 p-1">

            <h1 className='text-asparagus font-semibold'>Sign In</h1>

            <div>

              <label className='text-asparagus'>Enter Email: </label>
              <input value = {sign_in_email} placeholder = "Email" id = "sign_in_email" onChange = {(e) => set_sign_in_email(e.target.value)} className = "w-20 bg-amber-50" type = "email" ></input>

            </div>
    
            <div>

              <label className='text-asparagus'>Enter Password: </label>
              <input value = {sign_in_password} placeholder = "Password" onChange = {(e) => set_sign_in_password(e.target.value)} className = "w-20 bg-amber-50" type = "password" ></input>

            </div>

            <button type = "submit" onClick = { sign_in } className={`${ clicked ? 'bg-green-500' : 'bg-amber-50'} cursor-pointer bg-amber-50 w-20 border-1 border-asparagus`}>Sign In</button>

            <h1 className='text-red-600'>Invalid Credentials</h1>

            <hr className='border-asparagus w-60'></hr>

            <h1 className='text-asparagus font-semibold'>Create Account</h1>

            <div>

              <label className='text-asparagus'>Enter Email: </label>
              <input value = {create_email} placeholder = "Email" onChange = {(e) => set_create_email(e.target.value)} className = "w-20 bg-amber-50" type = "email" ></input>

            </div>
    
            <div>

              <label className='text-asparagus'>Enter Password: </label>
              <input value = {create_password} placeholder = "Email" onChange = {(e) => set_create_password(e.target.value)} className = "w-20 bg-amber-50" type = "password" ></input>

            </div>

            <button type = "submit" onClick = {create_account} className='cursor-pointer hover:bg-amber-100 bg-amber-50 w-20 border-1 border-asparagus'>Create</button>
            <h1 className='text-red-600'>Invalid Credentials</h1>
            <h1 className='text-green-600'>Account Created</h1>

          </div>

    
    </>

  );

}
