import React from 'react';
import { AiOutlineUserSwitch } from 'react-icons/ai';
import { VscSignOut } from 'react-icons/vsc';
import { useUser } from '../contexts/UserContext';

export default function AccountDropDown({ open }: { open: boolean }) {
  const { user, GoogleLogIn, GoogleLogOut } = useUser();

  if (!open) return null;

  return (
    <div className="bg-ghost absolute top-24 right-3 z-10 flex flex-col items-center gap-3 rounded-md border border-neutral-400 p-4 tracking-tighter">
      <h1 className="text-sm font-medium">{user?.email}</h1>

      <img src={user?.picture ?? ''} alt="" className="h-auto w-22 rounded-full" />

      <h1 className="text-xl">
        Hello, <span className="text-xl font-medium tracking-tighter">{user?.firstName}!</span>
      </h1>

      <button
        onClick={GoogleLogOut}
        className="text-night flex w-full cursor-pointer flex-row items-center rounded-md border border-neutral-400 p-1.5 transition-colors duration-150 hover:bg-gray-300"
      >
        <VscSignOut className="ml-1" size={24} />
        <span className="pl-8">Log Out</span>
      </button>

      <button
        onClick={GoogleLogIn}
        className="text-night flex w-full cursor-pointer flex-row items-center rounded-md border border-neutral-400 p-1.5 transition-colors duration-150 hover:bg-gray-300"
      >
        <AiOutlineUserSwitch className="ml-1" size={24} />
        <span className="pl-1.5">Switch Accounts</span>
      </button>
    </div>
  );
}
