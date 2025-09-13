import React from 'react';
import ServerStatusIndicator from './ServerStatusIndicator';

export default function LogInLeftPanel() {
  return (
    <>
      <div className="relative flex items-center gap-3 text-center">
        <img
          src="/logoAnimated.svg"
          alt="GeckoAI Logo"
          draggable={false}
          className="w-22 drop-shadow-xl/50"
        />
        <h1
          className="bg-clip-text text-4xl font-extrabold text-transparent drop-shadow-xl/50 sm:text-5xl md:text-6xl lg:text-7xl"
          style={{
            backgroundImage: `
                radial-gradient(circle at top left, #698f3f, transparent),
                radial-gradient(circle at bottom right, #484f1f, transparent),
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

        <ServerStatusIndicator />
      </div>
    </>
  );
}
