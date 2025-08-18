import React from 'react';
import { AiOutlineUserSwitch } from "react-icons/ai";
import { VscSignOut } from "react-icons/vsc";
import { useUser } from '../contexts/UserContext';

export default function AccountDropDown({ open }: { open: boolean }) {

  const { user, GoogleLogIn, GoogleLogOut } = useUser();

  if (!open) return null;

  return (
    <div className="tracking-tighter p-4 flex gap-3 flex-col items-center bg-ghost rounded-md border border-neutral-400 absolute top-24 right-3 z-10">

      <h1 className="text-sm font-medium">{user?.email}</h1>

      <img src={user?.picture ?? ""} alt="" className="rounded-full w-22 h-auto" />

      <h1 className="text-xl">Hello, <span className="font-medium text-xl">{user?.firstName}!</span></h1>

      <button onClick={GoogleLogOut} className="hover:bg-gray-300 flex flex-row items-center w-full transition-colors duration-150 border border-neutral-400 p-1.5 cursor-pointer rounded-md text-night">

        <VscSignOut className="ml-1" size={24} />
        <span className="pl-8">Log Out</span>

      </button>

      <button onClick={GoogleLogIn} className="hover:bg-gray-300 flex flex-row items-center w-full transition-colors duration-150 border border-neutral-400 p-1.5 cursor-pointer rounded-md text-night">

        <AiOutlineUserSwitch className="ml-1" size={24} />
        <span className="pl-1.5">Switch Accounts</span>

      </button>
      
    </div>
  );
}
