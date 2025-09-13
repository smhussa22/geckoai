'use client';
import React from 'react';
import { useState } from 'react';

export default function AdminTestButton() {
  const [bounce, setBounce] = useState(false);

  const handleBounce = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 500);
  };

  const handleClick = async () => {
    handleBounce();

  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`${bounce && 'animate-bounce'} cursor-pointer rounded-md bg-sky-300 px-5 font-semibold shadow-md transition-colors duration-200 hover:bg-sky-400`}
      >
        Test Button
      </button>
    </>
  );
}
