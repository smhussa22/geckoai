import React from 'react';
import Logo from './Logo';
import ServerStatusIndicator from './ServerStatusIndicator';

export default function LogInLeftPanel() {

    return (

        <>

            <div className='flex text-center items-center relative gap-4'>

                <Logo logoColor = "#698f3f" className = "w-22"/>

                <h1 className="text-6xl font-extrabold bg-clip-text text-transparent"
                style={{
                backgroundImage: `
                radial-gradient(circle at top left, #698f3f, transparent),
                radial-gradient(circle at bottom right, #384f1f, transparent),
                radial-gradient(circle at 70% 30%, #698f3f, transparent),
                radial-gradient(circle at 30% 70%, #384f1f, transparent)
                `,
                backgroundSize: '300% 300%, 300% 300%, 300% 300%, 300% 300%',
                backgroundPosition: '0% 0%, 100% 100%, 50% 50%, 20% 80%',
                backgroundRepeat: 'no-repeat',
                animation: 'mesh-move 6s ease-in-out infinite',
                }}
                
                >
  
                GeckoAI

                </h1>

                <ServerStatusIndicator/>
            
            </div>
        
        </>

    );

}