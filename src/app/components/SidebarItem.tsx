'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import Icon from './Icon';

type ButtonProps = {

  buttonIcon: React.ReactNode;
  buttonRoute: string;
  buttonText: string;
  isExpanded: boolean;

};

export default function SidebarItem({ buttonIcon, buttonRoute, buttonText, isExpanded }: ButtonProps) {

  const router = useRouter();
  const pathName = usePathname();
  const isPage = pathName === buttonRoute;
  const tooltipId = `tooltip-${buttonText}`;

  return (

    <>

      <motion.button data-tooltip-id={tooltipId} data-tooltip-content={buttonText} onClick={() => router.push(buttonRoute)} className={` overflow-hidden w-full flex items-center my-2 gap-1 rounded-md cursor-pointer font-semibold transition-all duration-300 hover:scale-[1.05] hover:bg-neutral-800 ${isPage ? 'text-[#698f3f]' : 'text-[#384f1f]'}`}>
        
        <Icon icon={buttonIcon} />

        <AnimatePresence mode="wait">

          {isExpanded && (

            <motion.span key="text" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden whitespace-nowrap ml-2" >
            
              {buttonText}
            
            </motion.span>
          
          )}

        </AnimatePresence>

      </motion.button>

      {!isExpanded && (

        <Tooltip id={tooltipId} place="left" opacity={1} style={{ marginLeft: '0.5rem', backgroundColor: '#262626', padding: '0.4rem', borderRadius: '0.375rem', color: isPage ? '#698f3f' : '#384f1f', transition: 'color 0.3s', zIndex: 50 }} noArrow delayShow={0} delayHide={0} />

      )}

    </>

  );
  
}
