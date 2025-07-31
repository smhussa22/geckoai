import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import { useUser } from '@/lib/firebase_auth';

export default function UserMenu() {

    const user = useUser();
    
    const get_first_name = () => {

        if (!user || !user.displayName) { return null; }

        const first_name = user?.displayName.split(" ")[0];
        return first_name;

    }

    return (

        <>

            <div className = "flex justify-between items-center w-40 ml-3">

              <motion.div initial = { { opacity: 0 } } animate = {{ opacity: 1 }} transition = { { duration: 0.4 } } className = "leading-4">

                <h4 className = "text-asparagus">{get_first_name()}</h4>
                <span className = "text-xs text-broccoli">{user?.email}</span>

              </motion.div>

              <motion.div initial = { { opacity: 0 } } animate = {{ opacity: 1 }} transition = { { duration: 0.4 } } >

                <button className='cursor-pointer transition-transform duration-100 hover:scale-[1.1]'>
                
                  <MoreVertical color='#698f3f' size={20} className="hover:bg-neutral-800 rounded-lg"/>
                
                </button>

              </motion.div>

            </div>

        </>

    );

}