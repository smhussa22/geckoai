'use client';
import React from 'react';

const sections = [

    { id: "introduction", title: "Introduction" },
    { id: "definitions", title: "Definitions" },
    { id: "acceptance-of-terms", title: "Acceptance of Terms" },
    { id: "service-description", title: "Description of the Service" },
    { id: "user-accounts", title: "User Accounts & Eligibility" },
    { id: "acceptable-use", title: "Acceptable Use Policy" },
    { id: "user-content", title: "User Content & Intellectual Property" },
    { id: "ai-disclaimer", title: "AI-Generated Content Disclaimer" },
    { id: "payments", title: "Payments, Subscriptions & Refunds" },
    { id: "privacy", title: "Privacy & Data Handling" },
    { id: "termination", title: "Termination & Suspension" },
    { id: "liability", title: "Limitation of Liability & Disclaimers" },
    { id: "indemnification", title: "Indemnification" },
    { id: "changes", title: "Changes to the Terms" },
    { id: "governing-law", title: "Governing Law & Dispute Resolution" },
    { id: "contact", title: "Contact Information" },

  ];

export default function TermsOfService() {


  return (

    <>

        <h1 className='text-asparagus text-5xl font-bold tracking-tighter mb-2'>GeckoAI's Terms Of Service</h1>

        <div>
      
            {sections.map((section) => (
        
                <div key={section.id} className="mb-1">
            
                    <h2 id={section.id} className="p-0.5 text-asparagus cursor-pointer hover:text-broccoli transition-colors duration-200 font-semibold tracking-tighter"> {}. {section.title} </h2>
            
                </div>

            ))}

        </div>

    </>

  );

}
