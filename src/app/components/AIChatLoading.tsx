import React from "react";

export default function AIChatIcon() {

    return (
        
        <div className="flex justify-start">

            <div className="animate-pulse tracking-tighter w-[30%] flex items-start gap-5">

                <img src="/logoAnimated.svg" alt="AI"  className="p-1.5 rounded-full h-11 w-11 shrink-0"/>

                <div className="flex-1 flex flex-col gap-1.5 mt-3">

                    <div className="bg-gradient-to-r from-neutral-800 via-broccoli to-neutral-800 bg-[length:200%_100%] animate-[loading_5.5s_infinite] p-2.5 rounded-md"/>
                    <div className="bg-gradient-to-r from-neutral-800 via-broccoli to-neutral-800 bg-[length:200%_100%] animate-[loading_5.5s_infinite] p-2.5 rounded-md"/>
                    <div className="bg-gradient-to-r from-neutral-800 via-broccoli to-neutral-800 bg-[length:200%_100%] animate-[loading_5.5s_infinite] w-3/5 p-2.5 rounded-md"/>
                
                </div>

            </div>
            
        </div>
    );

}