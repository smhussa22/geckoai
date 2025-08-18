import '../globals.css';

export default function AuthLayout({children}: { children: React.ReactNode; }) {

  return (

    <div className="auth-layout flex flex-col p-4 h-screen bg-night">
      
      {children}
      
    </div>

  );

}
